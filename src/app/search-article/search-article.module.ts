import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchArticlePageRoutingModule } from './search-article-routing.module';

import { SearchArticlePage } from './search-article.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchArticlePageRoutingModule
  ],
  declarations: [SearchArticlePage]
})
export class SearchArticlePageModule {}
