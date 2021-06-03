import { Router } from '@angular/router';
import { ArticleCategory } from './../serv/article-service.service';
import { ApiService } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-screen',
  templateUrl: './search-screen.page.html',
  styleUrls: ['./search-screen.page.scss'],
})
export class SearchScreenPage implements OnInit {

  onQueue = true;
  categories: ArticleCategory[] = [];

  searchKeyword = '';

  endQueue(event?){
    this.onQueue = false;
  }

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    this.queueForCategories();
  }

  private queueForCategories(){
    this.apiService.getCategories().subscribe(
      (data: any[]) => {
        this.categories = [];
        for(let d of data){
          var category = {
            id: d.id,
            name: d.name
          };
          this.categories.push(category);
        }
      },
      (error) => {
        this.endQueue();
      },
      () => {
        this.endQueue();
      }
    )
  }
  

  onSearch($event){
    console.log('searching '+this.searchKeyword);
    this.router.navigateByUrl('/search-article?keyword='+this.searchKeyword);
  }
  

  onCategorySelect(category: ArticleCategory){
    console.log(category.name);
    this.router.navigateByUrl('/search-article?categoryId='+category.id+'&categoryName='+category.name);    
  }

}
