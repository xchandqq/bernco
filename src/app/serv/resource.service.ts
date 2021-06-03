import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  constructor() { }

  public parseResource(d): Resource{
    let res: Resource = {
      id: d.id,
      title: d.title.rendered,

      mediaId: d.featured_media,
      mediaUrl: d.featured_media != 0 ? d._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url : '',

      location: d.acf.location.address,
      lat: d.acf.location.lat,
      lng: d.acf.location.lng,

      contact: d.acf.contact_number,
      website: d.acf.website,

      content: d.content.rendered,

      days: [],
      hours: [],

      galleryUrls: []
    }

    for(var open_hours of d.acf.open_hours){
      res.days.push(open_hours.day_of_the_week);
      res.hours.push(open_hours.time_of_the_day);
    }
    if(d.acf.gallery.length > 0){
      for(var gallery of d.acf.gallery){
        res.galleryUrls.push(gallery.sizes.thumbnail);
      }
    }

    return res;
  }

  public isResourceNearby(resource: Resource, lat: number, lng: number): boolean{
    var distance = this.calculateDistance(resource.lat, resource.lng, lat, lng);
    return distance < 5;
  }
  private toRadians(x) {
    return x * Math.PI / 180;
  }
  
  private calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6378.137; // Earth’s mean radius in meter
    var dLat = this.toRadians(lat2 - lat1);
    var dLong = this.toRadians(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in kilometer
  }
}

export interface Resource{
  id: number;
  title: string;

  mediaId: number;
  mediaUrl: string;

  location: string;
  lat: number;
  lng: number;

  contact: string;
  website: string;

  content: string;

  days: string[];
  hours: string[];

  galleryUrls: string[];
}