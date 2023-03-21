/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { createPathParamTemplateSplat, createPathTemplate } from '@cloudbeaver/core-utils';

import { NODE_PATH_TEMPLATE_RM_PROJECT } from './NODE_PATH_TEMPLATE_RM_PROJECT';

export const NODE_PATH_TEMPLATE_RM_PROJECT_RESOURCE = createPathTemplate(
  NODE_PATH_TEMPLATE_RM_PROJECT,
  createPathParamTemplateSplat('resourcePath', 'rm\\.resource')
);