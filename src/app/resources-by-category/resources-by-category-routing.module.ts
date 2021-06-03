import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResourcesByCategoryPage } from './resources-by-category.page';

const routes: Routes = [
  {
    path: '',
    component: ResourcesByCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourcesByCategoryPageRoutingModule {}
