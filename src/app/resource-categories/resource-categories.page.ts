import { MenuController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { ResourceCategory, ResourceCategoryService } from './../serv/resource-category.service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-resource-categories',
  templateUrl: './resource-categories.page.html',
  styleUrls: ['./resource-categories.page.scss'],
})
export class ResourceCategoriesPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;
  onQueueFromSearch = false;

  postPerPage = 8;
  page = 1;
  maxPages;
  resourceCategories: ResourceCategory[] = [];

  searchKeyword = '';

  constructor(private caller: CallNumber, private alert: AlertController,private menu: MenuController, private router: Router, private apiService: ApiService, private resourceCategoryService: ResourceCategoryService) {
    this.menu.enable(true);
  }

  ngOnInit() {
    this.queueForResourceCategories();
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromLoad = false;
    this.onQueueFromRefresh = false;
    this.onQueueFromSearch = false;
  }
  
  private queueForResourceCategories(event?){
    this.onNoConnection = false;
    if(this.searchKeyword.length == 0){
      this.apiService.getResourceCategories(this.postPerPage, this.page).subscribe(
        (data) => {
          this.maxPages = data['headers'].get('X-WP-TotalPages');
          if(this.onQueueFromRefresh){
            this.resourceCategories = [];
          }
          for(let d of data['body']){
            let article = this.resourceCategoryService.parseCategory(d);
            console.log(article);
            this.resourceCategories.push(article);
          }
        },
        (error) => {
          if(error.status == 0) this.onNoConnection = true;
          this.endQueue(event);
        },
        () => {
          this.page++;
          this.endQueue(event);
        }
      )
    }
    else{      
      this.apiService.getResourceCategoriesByKeyword(this.searchKeyword, this.postPerPage, this.page).subscribe(
        (data) => {
          this.maxPages = data['headers'].get('X-WP-TotalPages');
          if(this.onQueueFromRefresh || this.onQueueFromSearch){
            this.resourceCategories = [];
          }
          for(let d of data['body']){
            let article = this.resourceCategoryService.parseCategory(d);
            console.log(article);
            this.resourceCategories.push(article);
          }
        },
        (error) => {
          if(error.status == 0) this.onNoConnection = true;
          this.endQueue(event);
        },
        () => {
          this.page++;
          this.endQueue(event);
        }
      )
    }
    this.queueForApplicationSettings();
  }

  isOnQueueByAny(){
    return this.onQueue || this.onQueueFromLoad || this.onQueueFromRefresh || this.onQueueFromSearch;
  }

  // events
  onRefresh(event){
    this.page = 1;
    this.onQueueFromRefresh = true;
    this.queueForResourceCategories(event);
  }

  onLoadMore(event){
    this.onQueueFromLoad = true;
    this.queueForResourceCategories(event);
  }

  onSearch(event){
    this.resourceCategories = [];
    this.page = 1;
    this.onQueueFromSearch = true;
    this.queueForResourceCategories();
  }

  onClickCategory(category: ResourceCategory){
    this.resourceCategoryService.setSelectedCategory(category);
    this.router.navigateByUrl('/resources-by-category?categoryId='+category.id);
  }

  noConnectionMessage = '';
  onNoConnection = false;
  onReconnect(event){
    this.page = 1;
    this.onQueue = true;
    this.queueForResourceCategories();
  }


  external_link = '';
  contact_name = '';
  contact_number = '';
  async onCall(){
    let callModal = await this.alert.create({
      cssClass: 'callModal',
      buttons: [{
        text: this.contact_number,
        handler: () => {
          this.initializeCall();
        }
      }],
      message: '<div class="modal"><img src="/assets/phone-call.png" alt=""><div><h3 class="ff-m">Call Us Now We\'re here to help!</h3><span class="ff-p">'+this.contact_name+'</span></div></div>',
      
    });

    await callModal.present();
  }
  private queueForApplicationSettings(){
    this.apiService.getApplicationSetting([ApplicationSetting.hamburger_menu_external_link, ApplicationSetting.contact_name, ApplicationSetting.contact_number]).subscribe(
      (data) => {
        this.contact_name = data['acf'].contact_name;
        this.contact_number = data['acf'].contact_number;
        this.external_link = data['acf'].hamburger_menu_external_link;
      }
    )
  }
  private initializeCall(){
    this.caller.callNumber(this.contact_number, true)
    .then((value) => {
      console.log(value);
    });
  }

}
