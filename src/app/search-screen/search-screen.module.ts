import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchScreenPageRoutingModule } from './search-screen-routing.module';

import { SearchScreenPage } from './search-screen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchScreenPageRoutingModule
  ],
  declarations: [SearchScreenPage]
})
export class SearchScreenPageModule {}
