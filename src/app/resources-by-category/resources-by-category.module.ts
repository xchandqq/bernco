import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResourcesByCategoryPageRoutingModule } from './resources-by-category-routing.module';

import { ResourcesByCategoryPage } from './resources-by-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResourcesByCategoryPageRoutingModule
  ],
  declarations: [ResourcesByCategoryPage]
})
export class ResourcesByCategoryPageModule {}
