import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchScreenPage } from './search-screen.page';

const routes: Routes = [
  {
    path: '',
    component: SearchScreenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchScreenPageRoutingModule {}
