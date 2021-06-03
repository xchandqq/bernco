import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './../serv/api.service';
import { Resource, ResourceService } from './../serv/resource.service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { AlertController } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;

@Component({
  selector: 'app-resource',
  templateUrl: './resource.page.html',
  styleUrls: ['./resource.page.scss'],
})
export class ResourcePage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  map;

  id;
  resource: Resource = undefined;
  galleryUrls: string[] = [];

  constructor(private resourceService: ResourceService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, private caller: CallNumber, private alert: AlertController) { }

  ngOnInit() {
    var hasId = this.route.snapshot.queryParamMap.has('id');
    if(hasId){
      this.id = this.route.snapshot.queryParamMap.get('id');
      this.queueForSingleResource();
    }
    else{
      this.router.navigateByUrl('/resource-categories', {replaceUrl: true});
      return;
    }
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromRefresh = false;
  }

  private queueForSingleResource(event?){
    this.apiService.getSingleResource(this.id).subscribe(
      (data) => {
        this.galleryUrls = [];
        this.resource = this.resourceService.parseResource(data);
        this.loadImageProcess();
      },
      (error) => {
        this.endQueue(event);
      },
      () => {
        this.endQueue(event);
      }
    );
  }

  loadMoreImages(event){
    setTimeout(()=>{
      this.loadImageProcess(event);
    }, 1000);
  }

  private loadImageProcess(event?){
    var start = this.galleryUrls.length;
    var addCount = 4;
    for(var i = start; i<start + addCount; i++){
      if(i < this.resource.galleryUrls.length) this.galleryUrls.push(this.resource.galleryUrls[i]);
      else break;
    }
    console.log(this.galleryUrls);
    console.log(this.infiniteScrollDisabled());
    
    
    if(event != undefined) event.target.complete();
  }

  infiniteScrollDisabled(): boolean{
    if(this.resource == undefined) return true;
    return this.galleryUrls.length == this.resource.galleryUrls.length || this.currentTabIndex != 2;
  }
  

  currentTabIndex = 0;
  onTabClick(event, index){
    console.log(this.infiniteScrollDisabled());
    
    var tabs = document.getElementsByClassName('content-tab');
    Array.prototype.forEach.call(tabs, function(tab: HTMLElement){
      tab.setAttribute('disabled', 'true');
      if(tab.classList.contains('tab-active')) tab.classList.remove('tab-active');
    })
    var elem = event.target as HTMLElement;
    elem.classList.add('tab-active');

    setTimeout(()=>{
      this.currentTabIndex = index;
      if(this.currentTabIndex == 3){
        setTimeout(()=>{
          this.initializeMap();
        }, 250);
      }
    }, 50);
  }
  
  onRefresh(event){
    this.onQueueFromRefresh = true;
    this.queueForSingleResource(event);
  }

  toCenter(){
    this.map.setCenter(new google.maps.LatLng(this.resource.lat, this.resource.lng));
  }
  
  async onCall(){
    let callModal = await this.alert.create({
      cssClass: 'callModal',
      buttons: [{
        text: this.resource.contact,
        handler: () => {
          this.initializeCall();
        }
      }],
      message: '<div class="modal"><img src="/assets/phone-call.png" alt=""><div><h3 class="ff-m">Call Us Now We\'re here to help!</h3><span class="ff-p">'+this.resource.title+'</span></div></div>',
      
    });

    await callModal.present();
  }
  private initializeCall(){
    this.caller.callNumber(this.resource.contact, true)
    .then((value) => {
      console.log(value);
    });
  }

  private initializeMap(){
    var latLng = new google.maps.LatLng(this.resource.lat, this.resource.lng);
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    console.log(map);
    
    new google.maps.Marker({
      position: latLng,
      map
    });
    this.map = map;
  }

}
