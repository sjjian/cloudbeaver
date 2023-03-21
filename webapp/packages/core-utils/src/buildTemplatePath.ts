/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { PathParams, PathTemplate } from './createPathTemplate';
import { mapTemplateParams } from './mapTemplateParams';

export function buildTemplatePath<
  TTemplate extends string,
  TParams extends PathParams<TTemplate>
>(
  template: PathTemplate<TParams>,
  params: TParams,
): string {
  return template.build(mapTemplateParams(template, params), {
    urlParamsEncoding: 'none',
    ignoreConstraints: true,
  });
}