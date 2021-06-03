import { TestBed } from '@angular/core/testing';

import { ResourceCategoryService } from './resource-category.service';

describe('ResourceCategoryService', () => {
  let service: ResourceCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
