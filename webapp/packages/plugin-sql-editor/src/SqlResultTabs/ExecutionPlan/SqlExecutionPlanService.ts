/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { makeObservable, observable } from 'mobx';
import axios from 'axios';

import { ConnectionExecutionContextService, ConnectionInfoResource, createConnectionParam } from '@cloudbeaver/core-connections';
import { injectable } from '@cloudbeaver/core-di';
import { NotificationService } from '@cloudbeaver/core-events';
import type { ITask } from '@cloudbeaver/core-executor';
import { AsyncTaskInfoService, GraphQLService, SqlExecutionPlan } from '@cloudbeaver/core-sdk';
import { uuid } from '@cloudbeaver/core-utils';

import type { ISqlEditorTabState } from '../../ISqlEditorTabState';
import { SqlDataSourceService } from '../../SqlDataSource/SqlDataSourceService';

interface IExecutionPlanData {
  task: ITask<SqlExecutionPlan>;
  executionPlan: SqlExecutionPlan | null;
}

type AuditTask = {
  task_id: number;
  instance_db_type: string;
  pass_rate: number;
  score: number;
  audit_level: string;
};

type AuditTaskDesc = {
  number: number;
  audit_level: string;
  exec_sql: string;
  audit_result: AuditResult[];
}

type AuditResult = {
  level: string;
  message: string;
  rule_name: string;
}

type AuditTaskRes = {
  code: number;
  data: AuditTask;
  message: string;
};

type AuditTaskDescRes = {
  code: number;
  data: AuditTaskDesc[];
  message: string;
}

export type AuditTaskResult = {
  taskInfo: AuditTask | null
  taskDesc: AuditTaskDesc[] | null
}


@injectable()
export class SqlExecutionPlanService {
  data: Map<string, IExecutionPlanData>;
  auditData: Map<string, AuditTaskResult>;

  constructor(
    private readonly graphQLService: GraphQLService,
    private readonly notificationService: NotificationService,
    private readonly asyncTaskInfoService: AsyncTaskInfoService,
    private readonly connectionExecutionContextService: ConnectionExecutionContextService,
    private readonly sqlDataSourceService: SqlDataSourceService,
    private readonly connectionInfoResource: ConnectionInfoResource,
  ) {
    this.data = new Map();
    this.auditData = new Map();

    makeObservable(this, {
      data: observable,
      auditData: observable,
    });
  }

  async audit(editorState: ISqlEditorTabState, query: string): Promise<void> {
    const dataSource = this.sqlDataSourceService.get(editorState.editorId);
    const contextInfo = dataSource?.executionContext;

    const executionContext = contextInfo && this.connectionExecutionContextService.get(contextInfo.id);
    if (!contextInfo || !executionContext) {
      console.error('audit executionContext is not provided');
      return;
    }

    const connection = this.connectionInfoResource.get(createConnectionParam(contextInfo.projectId, contextInfo.connectionId));
    if (!connection) {
      console.error('audit connection is not provided');
      return
    }

    var task: AuditTaskResult = {
      taskInfo: null,
      taskDesc: null,
    };

    try {
      const split = connection.name.split(":", 2)
      if (split.length <= 1) {
        return
      }

      const { data, status } = await axios.post<AuditTaskRes>(
        "/v1/projects/" + split[0] + "/tasks/audits",
        { instance_name: split[1].trim(), instance_schema: contextInfo.defaultCatalog, sql: query},
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      task.taskInfo = data.data
  
      console.log(JSON.stringify(data, null, 4));
  
      if (status != 200 || data.code != 0) {
        console.error('audit failed, status=' + status + ", message: " + data.message);
        return 
      }
  
    } catch (error) {

      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        // return error.message;
      } else {
        console.log('unexpected error: ', error);
        // return 'An unexpected error occurred';
      }
    }

    try {
      const { data, status } = await axios.get<AuditTaskDescRes>(
        "/v2/tasks/audits/"+ task.taskInfo?.task_id + "/sqls?page_index=1&page_size=100",
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      console.log(JSON.stringify(data, null, 4));

      if (status != 200 || data.code != 0) {
        console.error('audit failed, status=' + status + ", message: " + data.message);
        return 
      }
      task.taskDesc = data.data

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        // return error.message;
      } else {
        console.log('unexpected error: ', error);
        // return 'An unexpected error occurred';
      }
    }

    const tabId = this.createAuditTab(editorState, query);
    editorState.currentTabId = tabId;

    this.auditData.set(tabId, task);

    console.log(dataSource)
    
    console.log("audit: name[" + connection.name + "] sql["+ query +"], schema["+contextInfo.defaultCatalog+"]")
  }

  async executeExecutionPlan(editorState: ISqlEditorTabState, query: string): Promise<void> {
    const dataSource = this.sqlDataSourceService.get(editorState.editorId);
    const contextInfo = dataSource?.executionContext;

    const executionContext = contextInfo && this.connectionExecutionContextService.get(contextInfo.id);

    if (!contextInfo || !executionContext) {
      console.error('executeExecutionPlan executionContext is not provided');
      return;
    }

    const tabId = this.createExecutionPlanTab(editorState, query);
    editorState.currentTabId = tabId;

    const asyncTask = this.asyncTaskInfoService.create(async () => {
      const { taskInfo } = await this.graphQLService.sdk.asyncSqlExplainExecutionPlan({
        connectionId: contextInfo.connectionId,
        contextId: contextInfo.id,
        query,
        configuration: {},
      });

      return taskInfo;
    });

    const task = executionContext.run(
      async () => {
        const info = await this.asyncTaskInfoService.run(asyncTask);
        const { result } = await this.graphQLService.sdk.getSqlExecutionPlanResult({ taskId: info.id });

        return result;
      },
      () => this.asyncTaskInfoService.cancel(asyncTask.id),
      () => this.asyncTaskInfoService.remove(asyncTask.id),
    );

    this.data.set(tabId, {
      task,
      executionPlan: null,
    });

    try {
      const executionPlan = await task;

      const tab = editorState.tabs.find(tab => tab.id === tabId);

      if (!tab) {
        // tab can be closed before we get result
        return;
      }

      this.data.set(tabId, {
        task,
        executionPlan,
      });
    } catch (exception: any) {
      const cancelled = task.cancelled;
      const message = cancelled ? 'Execution plan process has been canceled' : undefined;
      this.notificationService.logException(exception, 'Execution plan Error', message);
      this.removeTab(editorState, tabId);

      if (!cancelled) {
        throw exception;
      }
    }
  }

  private removeTab(state: ISqlEditorTabState, tabId: string) {
    const tab = state.tabs.find(tab => tab.id === tabId);
    if (tab) {
      state.tabs.splice(state.tabs.indexOf(tab), 1);
    }
    this.removeExecutionPlanTab(state, tabId);

    if (state.tabs.length > 0) {
      state.currentTabId = state.tabs[0].id;
    } else {
      state.currentTabId = '';
    }
  }

  removeExecutionPlanTab(state: ISqlEditorTabState, tabId: string): void {
    const executionPlanTab = state.executionPlanTabs.find(executionPlanTab => executionPlanTab.tabId === tabId);

    if (executionPlanTab) {
      state.executionPlanTabs.splice(state.executionPlanTabs.indexOf(executionPlanTab), 1);
    }

    const data = this.data.get(tabId);

    if (data) {
      data.task.cancel();
    }

    this.data.delete(tabId);
  }

  private createExecutionPlanTab(state: ISqlEditorTabState, query: string) {
    const dataSource = this.sqlDataSourceService.get(state.editorId);
    if (!dataSource) {
      throw new Error('SQL Data Source is not provided');
    }

    const id = uuid();
    const order = Math.max(0, ...state.tabs.map(tab => tab.order + 1));
    const nameOrder = Math.max(1, ...state.executionPlanTabs.map(tab => tab.order + 1));

    state.executionPlanTabs.push({
      tabId: id,
      order: nameOrder,
      query,
    });

    state.tabs.push({
      id,
      name: `Execution plan - ${nameOrder}`,
      icon: 'execution-plan-tab',
      order,
    });

    return id;
  }


  // private removeAuditTab(state: ISqlEditorTabState, tabId: string) {
  //   const tab = state.tabs.find(tab => tab.id === tabId);
  //   if (tab) {
  //     state.tabs.splice(state.tabs.indexOf(tab), 1);
  //   }
  //   this.removeAuditTab2(state, tabId);

  //   if (state.tabs.length > 0) {
  //     state.currentTabId = state.tabs[0].id;
  //   } else {
  //     state.currentTabId = '';
  //   }
  // }

  removeAuditTab2(state: ISqlEditorTabState, tabId: string): void {
    const auditTab = state.auditTabs.find(auditTab => auditTab.tabId === tabId);

    if (auditTab) {
      state.auditTabs.splice(state.auditTabs.indexOf(auditTab), 1);
    }

    this.auditData.delete(tabId);
  }

  private createAuditTab(state: ISqlEditorTabState, query: string) {
    const dataSource = this.sqlDataSourceService.get(state.editorId);
    if (!dataSource) {
      throw new Error('SQL Data Source is not provided');
    }

    const id = uuid();
    const order = Math.max(0, ...state.tabs.map(tab => tab.order + 1));
    const nameOrder = Math.max(1, ...state.auditTabs.map(tab => tab.order + 1));

    state.auditTabs.push({
      tabId: id,
      order: nameOrder,
      query,
    });

    state.tabs.push({
      id,
      name: `Audit - ${nameOrder}`,
      icon: 'execution-plan-tab',
      order,
    });

    return id;
  }
}
