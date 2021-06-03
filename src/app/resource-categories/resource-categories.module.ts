import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResourceCategoriesPageRoutingModule } from './resource-categories-routing.module';

import { ResourceCategoriesPage } from './resource-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResourceCategoriesPageRoutingModule
  ],
  declarations: [ResourceCategoriesPage]
})
export class ResourceCategoriesPageModule {}
