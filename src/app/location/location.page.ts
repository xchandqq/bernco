import { LocalDatabaseService } from './../serv/local-database.service';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { Component, ViewChild, ElementRef } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { NavController, Platform, MenuController, IonRouterOutlet } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit  {
  map: any;

  isInit = false;
  address: string;
  latitude: number = 8;
  longitude: number = 124;

  bufferAddress: string;
  bufferLatitude: number;
  bufferLongitude: number;

  constructor(private menu: MenuController, private ionRouter: IonRouterOutlet, private platform: Platform, private database: LocalDatabaseService, private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder, private nav: NavController) {}
  
  onSave(event){
    this.address = this.bufferAddress;
    this.latitude = this.bufferLatitude;
    this.longitude = this.bufferLongitude;
    this.database.storeLocation({
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude
    });
    //  save
    this.nav.back();
  }

  ngOnInit(): void {
  }

  ionViewDidEnter(){
    this.ionRouter.swipeGesture = false;
    this.menu.swipeGesture(false);
  }

  ionViewDidLeave(){
    this.ionRouter.swipeGesture = true;
    this.menu.swipeGesture(true);
  }

  ngAfterViewInit(): void {
    this.initializeMap();  
  }

  initializeMap(): void{

    var latLng
    
    if(this.database.hasStoredLocationData()){
      var loc = this.database.getStoredLocationData();
      latLng = new google.maps.LatLng(loc.latitude, loc.longitude);
    }
    else{
      latLng = new google.maps.LatLng(8, 124);
    }

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var input = document.getElementById('location-searchbar');    
    const autocomplete = new google.maps.places.Autocomplete(input);
    this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng());

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log(place);

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      this.map.setCenter(place.geometry.location);
      this.map.setZoom(17);

      this.bufferAddress = place.formatted_address;
      this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng());
    });


    this.map.addListener('dragend', () => {
      this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
    });


    this.geolocation.getCurrentPosition().then((resp) => {
      console.log('from GPS');
      
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      this.map.setCenter(latLng);
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  getAddressFromCoords(latitude, longitude) {
    this.bufferLatitude = latitude;
    this.bufferLongitude = longitude;
    console.log("getAddressFromCoords " + latitude + " " + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(latitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.bufferAddress = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);

        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.bufferAddress += value + ", ";
        }
        this.bufferAddress = this.bufferAddress.slice(0, -2);
        this.isInit = true;
      })
      .catch((error: any) => {
        this.bufferAddress = "Address Not Available!";
      });

  }
}