import { AlertController, MenuController } from '@ionic/angular';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';
import { Event, EventsService } from '../serv/events.service';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;

  postPerPage = 5;
  page = 1;
  maxPages;
  searchResultCount;
  events: Event[] = [];

  constructor(private caller: CallNumber, private alert: AlertController, private menu: MenuController, private apiService: ApiService, private eventService: EventsService) {
    this.menu.enable(true);
  }

  ngOnInit() {
    this.queueForEvents();
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromLoad = false;
    this.onQueueFromRefresh = false;
  }

  private queueForEvents(event?){
    this.onNoConnection = false;
    this.apiService.getEvents(this.postPerPage, this.page).subscribe(
      (data) => {
        this.maxPages = data['headers'].get('X-WP-TotalPages');
        this.searchResultCount = data['headers'].get('X-WP-Total');
        if(this.onQueueFromRefresh){
          this.events = [];
        }
        for(let d of data['body']){
          let event = this.eventService.parseEvent(d);
          this.events.push(event);
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
    );
    
    this.queueForApplicationSettings();
  }

  // events
  onRefresh(event){
    this.page = 1;
    this.onQueueFromRefresh = true;
    this.queueForEvents(event);
  }

  onLoadMore(event){
    this.onQueueFromLoad = true;
    this.queueForEvents(event);
  }

  onNoConnection = false;
  onReconnect(event){
    this.page = 1;
    this.onQueue = true;
    this.queueForEvents();
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
    this.apiService.getApplicationSetting([ApplicationSetting.contact_name, ApplicationSetting.contact_number, ApplicationSetting.hamburger_menu_external_link]).subscribe(
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
