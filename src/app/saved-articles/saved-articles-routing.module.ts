import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SavedArticlesPage } from './saved-articles.page';

const routes: Routes = [
  {
    path: '',
    component: SavedArticlesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedArticlesPageRoutingModule {}
