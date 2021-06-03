import { MenuController, AlertController } from '@ionic/angular';
import { ApplicationSetting, ApiService } from './../serv/api.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.page.html',
  styleUrls: ['./policy.page.scss'],
})
export class PolicyPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  queueError = false;
  content: string;

  constructor(private caller: CallNumber, private alert: AlertController, private menu: MenuController, private apiService: ApiService) {
    this.menu.enable(true);
  }

  ngOnInit() {
    this.queueForApplicationSettings();
  }

  public endQueue(event){
    if(event != undefined){
      event.target.complete();
      this.onQueueFromRefresh = false;
    }
    else this.onQueue = false;
  }

  private queueForApplicationSettings(event?){
    if(event != undefined) this.onQueueFromRefresh = true;
    else this.onQueue = true;    
    this.queueError = false;

    this.apiService.getApplicationSetting([ApplicationSetting.privacy,ApplicationSetting.contact_name, ApplicationSetting.contact_number, ApplicationSetting.hamburger_menu_external_link]).subscribe(
      (data) =>{
        this.content = data['acf'].privacy_policy;
        this.contact_name = data['acf'].contact_name;
        this.contact_number = data['acf'].contact_number;
        this.external_link = data['acf'].hamburger_menu_external_link;
      },
      (error) => {
        // no internet
        this.queueError = true;
        this.endQueue(event);        
      },
      () => {
        // done
        this.endQueue(event);     
      }
    )
  }

  public onRefresh(event){
    this.queueForApplicationSettings(event);
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
  private initializeCall(){
    this.caller.callNumber(this.contact_number, true)
    .then((value) => {
      console.log(value);
    });
  }
}
