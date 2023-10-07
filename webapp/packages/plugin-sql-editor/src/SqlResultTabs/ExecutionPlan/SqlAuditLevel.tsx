import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import styled, { css } from 'reshadow';

import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

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
import { ExecutionPlanTreeBlock } from './ExecutionPlanTreeBlock';
import { SqlExecutionPlanService } from './SqlExecutionPlanService';

const styles = css`
`;

interface Props {
  level: string;
}

export const SqlAuditLevel = observer<Props>(function SqlAuditLevel({ level }) {
  switch (level) {
    case "error":
      return styled(
        styles,
        splitStyles,
      )(
        <CloseCircleOutlined  style={{ fontSize: 20, color: '#f00000' }}/>
      );
    case "notice":
      return styled(
        styles,
        splitStyles,
      )(
        <InfoCircleOutlined style={{ fontSize: 20, color: '#3282e6' }}/>
      );
    case "warn":
      return styled(
        styles,
        splitStyles,
      )(
        <WarningOutlined style={{ fontSize: 20, color: '#ff8c00' }} />
      );
    default: 
      return styled(
        styles,
        splitStyles,
      )(
        <CheckCircleOutlined  style={{ fontSize: 20, color: '#52c41a' }} />
    );  
  }
});