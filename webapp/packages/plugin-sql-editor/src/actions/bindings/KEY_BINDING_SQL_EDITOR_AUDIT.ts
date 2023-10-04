import { createKeyBinding } from '@cloudbeaver/core-view';

export const KEY_BINDING_SQL_EDITOR_AUDIT = createKeyBinding({
  id: 'sql-editor-audit',
  keys: 'ctrl+a',
  preventDefault: true,
});
