import { LocalDatabaseService } from './../serv/local-database.service';
import { Platform, AlertController } from '@ionic/angular';
import { title } from 'process';
import { ResourceCategory, ResourceCategoryService } from './../serv/resource-category.service';
import { Resource, ResourceService } from './../serv/resource.service';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-resources-by-category',
  templateUrl: './resources-by-category.page.html',
  styleUrls: ['./resources-by-category.page.scss'],
})
export class ResourcesByCategoryPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;
  onQueueFromFilter = false;
  
  category: ResourceCategory;
  title = 'Resources';
  subtitle = '';
  description = '';
  resources: any[] = [];

  postPerPage = 5;
  page = 1;
  maxPages;

  filter = false;
  address: string = '';
  latitude: number;
  longitude: number;

  constructor(private caller: CallNumber, private alert: AlertController, private platform: Platform, private database: LocalDatabaseService, private resourceCategoryService: ResourceCategoryService , private resourceService: ResourceService, private apiService: ApiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.category = this.resourceCategoryService.getSelectedCategory();
    if(this.route.snapshot.queryParamMap.has('categoryId')){
      this.title = this.category==undefined? 'Uncategorized' : this.category.title;
      this.description = this.category==undefined? 'Find help with the available resources' : this.category.description;
      this.platform.ready().then(()=>{

        var isInit = this.database.isLocationInitialized();
        var canInit = this.database.canInitialize();
  
        if(!isInit && canInit){
          this.database.initialize()
          .then((db)=>{
            this.database.createLocationTable(db)
            .then(()=>{
              this.database.retrieveLocationData(db)
              .then((value)=>{
                this.database.finalizeLocationInitialization(value, db);
              })
            })
          })
          .finally(()=>{
            this.updateLocationData();
            this.queueForResourcesByCategory(); 
          });
        }
        else this.queueForResourcesByCategory(); 
      }); 
    }
    else{
      this.router.navigateByUrl('/resource-categories', {replaceUrl: true});
      return;
    }
  }

  ionViewDidEnter(){
    this.updateLocationData();
  }

  private updateLocationData(){    
    if(this.database.hasStoredLocationData()){
      var loc = this.database.getStoredLocationData();
      this.address = loc.address;
      this.latitude = loc.latitude;
      this.longitude = loc.longitude;
    }
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromLoad = false;
    this.onQueueFromRefresh = false;
    this.onQueueFromFilter = false;
  }

  private queueForResourcesByCategory(event?){

    this.apiService.getResourcesByCategory(this.category.id, this.postPerPage, this.page, this.filter, this.latitude, this.longitude).subscribe(
      (data) => {
        this.maxPages = data['headers'].get('X-WP-TotalPages');
        this.subtitle = data['headers'].get('X-WP-Total') + ' available resources';
        if(this.onQueueFromRefresh || this.onQueueFromFilter){
          this.resources = [];
        }
        for(let d of data['body']){
          let resource = this.resourceService.parseResource(d);
          console.log(resource);
          if(this.filter){
            if(this.resourceService.isResourceNearby(resource, this.latitude, this.longitude)) this.resources.push(resource);
          }
          else this.resources.push(resource);
        }
        
        if(this.filter) this.subtitle = this.resources.length + ' nearby resources';
      },
      (error) => {
        this.endQueue(event);
      },
      () => {
        this.page++;
        this.endQueue(event);
      }
    );

    this.queueForApplicationSettings();
  }

  // getters
  hasAddress(){
    return this.address.length > 0;
  }

  // events
  
  onRefresh(event){
    this.page = 1;
    this.onQueueFromRefresh = true;
    this.queueForResourcesByCategory(event);
  }

  onLoadMore(event){
    this.onQueueFromLoad = true;
    this.queueForResourcesByCategory(event);
  }

  onFilter(){
    setTimeout(()=>{
      this.subtitle = '';
      this.page = 1;
      this.onQueue = true;
      this.onQueueFromFilter = true;
      this.queueForResourcesByCategory();
    }, 100);
  }

  onResource(resource: Resource){
    this.router.navigateByUrl('/resource?id=' + resource.id);
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
