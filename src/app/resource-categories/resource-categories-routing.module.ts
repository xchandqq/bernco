import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResourceCategoriesPage } from './resource-categories.page';

const routes: Routes = [
  {
    path: '',
    component: ResourceCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourceCategoriesPageRoutingModule {}
