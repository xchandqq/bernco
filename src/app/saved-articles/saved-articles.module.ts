import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SavedArticlesPageRoutingModule } from './saved-articles-routing.module';

import { SavedArticlesPage } from './saved-articles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SavedArticlesPageRoutingModule
  ],
  declarations: [SavedArticlesPage]
})
export class SavedArticlesPageModule {}
