/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { computed, observable } from 'mobx';

import { UsersResource, RolesResource, AdminUser } from '@cloudbeaver/core-authentication';
import { injectable, IInitializableController } from '@cloudbeaver/core-di';
import { AdminRoleInfo, AdminSubjectType } from '@cloudbeaver/core-sdk';

import { IConnectionFormModel } from '../IConnectionFormModel';

@injectable()
export class Controller
implements IInitializableController {
  @observable selectedSubjects: Map<string, boolean> = new Map();

  @computed get users(): AdminUser[] {
    return Array.from(this.usersResource.data.values());
  }

  @computed get roles(): AdminRoleInfo[] {
    return Array.from(this.rolesResource.data.values());
  }

  get isLoading(): boolean {
    return this.usersResource.isLoading() || this.rolesResource.isLoading();
  }

  private model!: IConnectionFormModel;

  constructor(
    private usersResource: UsersResource,
    private rolesResource: RolesResource
  ) { }

  init(model: IConnectionFormModel): void {
    this.model = model;
    this.loadSubjects();
  }

  onSelect = (subjectId: string, state: boolean): void => {
    if (!state) {
      const index = this.model.grantedSubjects!.findIndex(subject => subject.subjectId === subjectId);
      if (index > -1) {
        this.model.grantedSubjects!.splice(index, 1);
      }
      return;
    }

    this.model.grantedSubjects!.push({
      connectionId: '',
      subjectId,
      subjectType: AdminSubjectType.User,
    });
  };

  private async loadSubjects() {
    await this.usersResource.loadAll();
    await this.rolesResource.loadAll();

    for (const subject of this.model.grantedSubjects || []) {
      this.selectedSubjects.set(subject.subjectId, true);
    }
  }
}
