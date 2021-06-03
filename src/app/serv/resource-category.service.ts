import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResourceCategoryService {

  public selectedCategory = undefined;

  constructor() { }
  public setSelectedCategory(category: ResourceCategory){
    this.selectedCategory = category;
  }

  public getSelectedCategory(): ResourceCategory{
    return this.selectedCategory;
  }

  public parseCategory(d): ResourceCategory{
    let rc: ResourceCategory = {
      id: d.id,
      title: d.name,
      mediaUrl: d.acf.featured_image != undefined ? d.acf.featured_image.sizes.medium : '',
      description: d.description
    }
    return rc;
  }
}

export interface ResourceCategory{
  id: number;
  title: string;
  mediaUrl: string;
  description: string;
}