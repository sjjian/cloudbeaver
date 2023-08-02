/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2019-2023 DBeaver Corp
 *
 * All Rights Reserved
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of DBeaver Corp and its suppliers, if any.
 * The intellectual and technical concepts contained
 * herein are proprietary to DBeaver Corp and its suppliers
 * and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from DBeaver Corp.
 */
import { observer } from 'mobx-react-lite';

import { Button, Group, Loader, s, useAutoLoad, useS, useTranslate } from '@cloudbeaver/core-blocks';
import { useService } from '@cloudbeaver/core-di';
import { CommonDialogBody, CommonDialogFooter, CommonDialogHeader, CommonDialogWrapper, DialogComponentProps } from '@cloudbeaver/core-dialogs';
import { NotificationService } from '@cloudbeaver/core-events';
import { type NavNode, NavTreeResource } from '@cloudbeaver/core-navigation-tree';

import { FiltersTable } from './FiltersTable';
import styles from './DVGroupingColumnEditorDialog.m.css';
import { useFilters } from './useFilters';

interface Payload {
  node: NavNode;
}

export const DVGroupingColumnEditorDialog = observer<DialogComponentProps<Payload>>(function DVGroupingColumnEditorDialog({
  rejectDialog,
  resolveDialog,
  payload,
}) {
  const translate = useTranslate();
  const style = useS(styles);
  const notificationService = useService(NotificationService);
  const navTreeResource = useService(NavTreeResource);
  const state = useFilters(payload.node.id);

  useAutoLoad(state);

  async function submit() {
    try {
      await navTreeResource.setFilter(payload.node.id, state.filters.include, state.filters.exclude);
      resolveDialog();
    } catch (exception: any) {
      notificationService.logException(exception, 'plugin_navigation_tree_filters_submit_fail');
    }
  }

  return (
    <CommonDialogWrapper size="large">
      <CommonDialogHeader
        title={translate('plugin_navigation_tree_filters_configuration', undefined, { name: payload.node.name })}
        icon="filter"
        onReject={rejectDialog}
      />
      <CommonDialogBody noOverflow noBodyPadding>
        <Loader state={state}>
          <Group box>
            <div className={s(style, { tablesContainer: true })}>
              <div className={s(style, { tableContainer: true })}>
                <FiltersTable
                  title={translate('plugin_navigation_tree_filters_include')}
                  filters={state.filters.include}
                  onAdd={state.include}
                  onDelete={state.deleteInclude}
                />
              </div>
              <div className={s(style, { tableContainer: true })}>
                <FiltersTable
                  title={translate('plugin_navigation_tree_filters_exclude')}
                  filters={state.filters.exclude}
                  onAdd={state.exclude}
                  onDelete={state.deleteExclude}
                />
              </div>
            </div>
          </Group>
        </Loader>
      </CommonDialogBody>
      <CommonDialogFooter>
        <div className={s(style, { footerContainer: true })}>
          <Button mod={['outlined']} onClick={rejectDialog}>
            {translate('ui_close')}
          </Button>
          <Button mod={['unelevated']} onClick={submit}>
            {translate('ui_apply')}
          </Button>
        </div>
      </CommonDialogFooter>
    </CommonDialogWrapper>
  );
});
