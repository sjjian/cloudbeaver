import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import styled, { css } from 'reshadow';

import { Loader, Pane, ResizerControls, Split, splitStyles, useSplitUserState } from '@cloudbeaver/core-blocks';
import { useService } from '@cloudbeaver/core-di';

import type { IAuditTab, IExecutionPlanTab } from '../../ISqlEditorTabState';
import { ExecutionPlanTreeBlock } from './ExecutionPlanTreeBlock';
import { PropertiesPanel } from './PropertiesPanel/PropertiesPanel';
import { SqlExecutionPlanService } from './SqlExecutionPlanService';

const styles = css`
  Pane {
    composes: theme-background-surface theme-text-on-surface from global;
  }
  Pane:first-child {
    overflow: hidden;
  }
`;

interface Props {
  auditTab: IAuditTab;
}

export const SqlAuditPanel = observer<Props>(function SqlAuditPanel({ auditTab }) {
  const sqlExecutionPlanService = useService(SqlExecutionPlanService);
  // const data = sqlExecutionPlanService.data.get(executionPlanTab.tabId);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const splitState = useSplitUserState('execution-plan');

  return styled(
    styles,
    splitStyles,
  )(
    <Split {...splitState} mode={selectedNode ? splitState.mode : 'minimize'} disable={!selectedNode} sticky={30}>
      <Pane>
        <a> tttttttt </a>
      </Pane>
      <ResizerControls />
    </Split>,
  );
});
