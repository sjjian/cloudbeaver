import { observer } from 'mobx-react-lite';
import styled, { css } from 'reshadow';

import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import { splitStyles } from '@cloudbeaver/core-blocks';

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