/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { createAction } from '@cloudbeaver/core-view';

export const ACTION_SQL_EDITOR_AUDIT = createAction('sql-editor-audit', {
  icon: '/icons/sql_execution_plan.svg',
  label: 'sql_editor_audit_button_tooltip',
});
