import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private httpClient: HttpClient) { }

  public parseEvent(d): Event{
    let event: Event = {
      id: d.id,
      title: d.title.rendered,
      mediaId: d.featured_media,
      mediaUrl: d.featured_media ? d._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url : '',
      date: d.acf.date,
      location: d.acf.location.address,
      tagIds: d['event-categories'],
      tagNames: []
    }

    console.log(event);
    
    
    for(var i = 0; i<event.tagIds.length; i++){
      for(var term of d._embedded['wp:term'][0]){
        if(term.id == event.tagIds[i]){
          event.tagNames.push(term.name);
        }
      }
    }

    return event;
  }
}

export interface Event{
  id: number;
  title: string;
  mediaId: number;
  mediaUrl: number;
  date: string;
  location: string;
  tagIds: number[];
  tagNames: string[];
}