import { AlertController } from '@ionic/angular';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  queueError = false;
  content: string;

  constructor(private apiService: ApiService, private caller: CallNumber, private alert: AlertController) { }

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

    this.apiService.getApplicationSetting([
      ApplicationSetting.hamburger_menu_external_link, 
      ApplicationSetting.terms, 
      ApplicationSetting.contact_name, 
      ApplicationSetting.contact_number]).subscribe(
      (data) =>{
        this.content = data['acf'].terms_and_conditions;
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
