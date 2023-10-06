/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { computed, observable } from 'mobx';

import { useObservableRef } from '@cloudbeaver/core-blocks';

import { createContext } from 'react';

import type { AuditTaskResult } from './SqlExecutionPlanService';
// export interface IExecutionPlanNode extends SqlExecutionPlanNode {
//   children: IExecutionPlanNode[];
// }

export interface SqlAuditContext {
  selectedNodes: Map<number, boolean>;
  // readonly columns: ObjectPropertyInfo[];
  // readonly nodes: IExecutionPlanNode[];
  selectNode: (nodeId: string) => void;
}

export const ExecutionPlanTreeContext = createContext<SqlAuditContext | null>(null);

// export function isVisibleProperty(property: ObjectPropertyInfo): boolean {
//   return property.features.includes('viewable');
// }

export function useSqlAuditState(taskResult: AuditTaskResult, onNodeSelect: (nodeId: number) => void): SqlAuditContext {
  return useObservableRef(
    () => ({
      selectedNodes: new Map(),
      // get columns() {
      //   const columns: ObjectPropertyInfo[] = [];

      //   for (const node of this.nodeList) {
      //     for (const property of node.properties) {
      //       if (property.id && isVisibleProperty(property) && !columns.find(column => column.id === property.id)) {
      //         columns.push(property);
      //       }
      //     }
      //   }

      //   return columns;
      // },
      // get nodes() {
      //   const map: Map<string, number> = new Map();

      //   const tree: IExecutionPlanNode[] = this.nodeList.map((node, idx) => {
      //     map.set(node.id, idx);
      //     return { ...node, children: [] };
      //   });

      //   const nodes: IExecutionPlanNode[] = [];

      //   for (const node of tree) {
      //     if (node.parentId) {
      //       const parent = map.get(node.parentId)!;
      //       tree[parent].children.push(node);
      //     } else {
      //       nodes.push(node);
      //     }
      //   }

      //   return nodes;
      // },
      selectNode(nodeId: number) {
        this.selectedNodes.clear();
        this.selectedNodes.set(nodeId, true);
        this.onNodeSelect(nodeId);
      },
    }),
    {
      selectedNodes: observable,
      nodeList: observable.ref,
      columns: computed,
      nodes: computed,
    },
    { nodeList, onNodeSelect },
    ['selectNode'],
  );
}
