import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import styled, { css } from 'reshadow';

import { 
  Loader, 
  Pane, 
  ResizerControls, 
  Split, 
  splitStyles, 
  useSplitUserState,
  Table,
  TableBody,
  TableColumnHeader,
  TableHeader,
  Textarea,
  TextPlaceholder,
  TableItem,
  TableColumnValue
} from '@cloudbeaver/core-blocks';
import { useService } from '@cloudbeaver/core-di';

import type { IAuditTab, IExecutionPlanTab } from '../../ISqlEditorTabState';
import { SqlExecutionPlanService } from './SqlExecutionPlanService';
import { useSqlAuditState } from './SqlAuditState'

const styles = css`
  Pane {
    composes: theme-background-surface theme-text-on-surface from global;
  }
  Pane:first-child {
    overflow: hidden;
  }
  Split {
    height: 100%;
  }
  ResizerControls {
    height: 100%;
    width: 2px;
  }
  Textarea > :global(textarea) {
    border: none !important;
  }
`;

interface Props {
  auditTab: IAuditTab;
}


export const SqlAuditPanel = observer<Props>(function SqlAuditPanel({ auditTab }) {
  const sqlExecutionPlanService = useService(SqlExecutionPlanService);
  const data = sqlExecutionPlanService.auditData.get(auditTab.tabId);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const splitState = useSplitUserState('sql-audit');

  // const items = (

  // )

  if (!data || !data.taskDesc || !data.taskDesc.length) {
    return styled(
      styles,
      splitStyles,
    )(
      <TextPlaceholder>"no data"</TextPlaceholder>
    )
  }
  const state = useSqlAuditState(data, setSelectedNode);

  var number = 0
  if (selectedNode) {
    number = selectedNode - 1
  }

  const taskDesc = data.taskDesc[number];
  console.log(taskDesc)

  return styled(
    styles,
    splitStyles,
  )(
    <Split {...splitState} sticky={30}  split="vertical" keepRatio>
      <Pane>
        {data && data.taskDesc && data.taskDesc.length ? (
          <Table selectedItems={state.selectedNodes} onSelect={state.selectNode}>
            <TableHeader fixed>
              <TableColumnHeader>序号</TableColumnHeader>
              <TableColumnHeader>SQL</TableColumnHeader>
              <TableColumnHeader>告警等级</TableColumnHeader>
            </TableHeader>
            <TableBody>
              {data.taskDesc.map(node => (
                <TableItem item={node.number} selectOnItem>
                  <TableColumnValue>{node.number}</TableColumnValue>
                  <TableColumnValue>{node.exec_sql}</TableColumnValue>
                  <TableColumnValue>{node.audit_level || "-"}</TableColumnValue>
                </TableItem>
              ))}
            </TableBody>
          </Table>
        ) : (
          <TextPlaceholder>"no data"</TextPlaceholder>
        )}
      </Pane>          

      <ResizerControls />

      <Pane basis="30%" main>
        <Table>
          <TableHeader fixed>
            <TableColumnHeader>规则</TableColumnHeader>
            <TableColumnHeader>等级</TableColumnHeader>
          </TableHeader>
          <TableBody>
            {taskDesc && taskDesc.audit_result && taskDesc.audit_result.map(node => (
              <TableItem item="auditDesc" selectOnItem>
                <TableColumnValue>{node.message}</TableColumnValue>
                <TableColumnValue>{node.level}</TableColumnValue>
              </TableItem>
            ))}
          </TableBody>
        </Table>
      </Pane>
    </Split>,
  );
});
