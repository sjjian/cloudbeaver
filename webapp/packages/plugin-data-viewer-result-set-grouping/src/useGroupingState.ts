/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { useTabLocalState } from '@cloudbeaver/core-ui';
import type { IResultSetGroupingData } from './DataContext/DATA_CONTEXT_DV_DDM_RS_GROUPING';
import type { IGroupingQueryState } from './IGroupingQueryState';
import { useObservableRef } from '@cloudbeaver/core-blocks';
import { action } from 'mobx';
const DEFAULT_GROUPING_QUERY_OPERATION = 'COUNT(*)';
interface IPrivateGroupingData extends IResultSetGroupingData {
  state: IDVResultSetGroupingPresentationState;
}

interface IDVResultSetGroupingPresentationState extends IGroupingQueryState {
  presentationId: string;
  functions: string[];
}
export const useDVResultSetGroupingPresentationState = (state?: IDVResultSetGroupingPresentationState) => {


  const groupingData = useObservableRef<IPrivateGroupingData>(
    () => ({
      getColumns() {
        return this.state.columns;
      },
      getOriginalColumns() {
        return [];
      },
      removeColumn(...columns) {
        this.state.columns = this.state.columns.filter(column => !columns.includes(column));
      },
      addColumn(column: string) {
        this.state.columns.push(column);
      },
      clear() {
        this.state.presentationId = '';
        this.state.columns = [];
      },
      getFunctions() {
        return this.state.functions;
      },
    }),
    {
      clear: action,
    },
    { state },
  );
  
  return {
    state,
    groupingData,
  };
};