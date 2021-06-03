import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleArticlePage } from './single-article.page';

const routes: Routes = [
  {
    path: '',
    component: SingleArticlePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleArticlePageRoutingModule {}
