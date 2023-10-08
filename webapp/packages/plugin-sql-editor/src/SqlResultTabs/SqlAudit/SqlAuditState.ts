import { observable } from 'mobx';

import { useObservableRef } from '@cloudbeaver/core-blocks';

import { createContext } from 'react';

import type { AuditTaskResult } from './SqlAuditService';

export interface SqlAuditContext {
  selectedNodes: Map<number, boolean>;
  selectNode: (nodeId: number) => void;
}

export const ExecutionPlanTreeContext = createContext<SqlAuditContext | null>(null);


export function useSqlAuditState(taskResult: AuditTaskResult, onNodeSelect: (nodeId: number) => void): SqlAuditContext {
  return useObservableRef(
    () => ({
      selectedNodes: new Map(),

      selectNode(nodeId: number) {
        this.selectedNodes.clear();
        this.selectedNodes.set(nodeId, true);
        this.onNodeSelect(nodeId);
      },
    }),
    {
      selectedNodes: observable,
    },
    { taskResult, onNodeSelect },
    ['selectNode'],
  );
}
