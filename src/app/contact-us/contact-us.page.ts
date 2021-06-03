import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;

  cn1;
  cn2;
  ca1;
  cno1;
  ce1;
  ct1;
  ct2;
  ct3;
  cnoa;
  cnob;
  cnoc;

  constructor(private caller: CallNumber, private alert: AlertController, private apiService: ApiService) { }

  ngOnInit() {
    this.queueForContactDetails();
  }
  

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromRefresh = false;
  }

  private queueForContactDetails(event?){
    this.apiService.getApplicationSetting([
      ApplicationSetting.contact_name_1,
      ApplicationSetting.contact_name_2,      
      ApplicationSetting.contact_address_1,   
      ApplicationSetting.contact_number_1,         
      ApplicationSetting.contact_email_1,   
      ApplicationSetting.contact_title_1,   
      ApplicationSetting.contact_title_2,   
      ApplicationSetting.contact_title_3,   
      ApplicationSetting.contact_number_a,
      ApplicationSetting.contact_number_b,
      ApplicationSetting.contact_number_c,
      ApplicationSetting.contact_name, 
      ApplicationSetting.contact_number,
      ApplicationSetting.hamburger_menu_external_link
    ]).subscribe(
      (data: any[]) => {
        this.cn1 = data['acf'].contact_name_1;
        this.cn2 = data['acf'].contact_name_2;
        this.ca1 = data['acf'].contact_address_1;
        this.cno1 = data['acf'].contact_number_1;
        this.ce1 = data['acf'].contact_email_1;
        this.ct1 = data['acf'].contact_title_1;
        this.ct2 = data['acf'].contact_title_2;
        this.ct3 = data['acf'].contact_title_3;
        this.cnoa = data['acf'].contact_number_a;
        this.cnob = data['acf'].contact_number_b;
        this.cnoc = data['acf'].contact_number_c;
        this.contact_name = data['acf'].contact_name;
        this.contact_number = data['acf'].contact_number;
        this.external_link = data['acf'].hamburger_menu_external_link
      },
      (error) => {
        this.endQueue(event);
      },
      () => {
        this.endQueue(event);
      }

    )
  }
  
  onRefresh(event){
    this.onQueueFromRefresh = true;
    this.queueForContactDetails(event);
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
