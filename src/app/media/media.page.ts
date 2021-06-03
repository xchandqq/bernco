import { ApplicationSetting, ApiService } from './../serv/api.service';
import { AlertController } from '@ionic/angular';
import { LocalDatabaseService } from './../serv/local-database.service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-media',
  templateUrl: './media.page.html',
  styleUrls: ['./media.page.scss'],
})
export class MediaPage implements OnInit {

  hasLoadedFacebook = false;
  hasLoadedTwitter = false;

  constructor(private apiService: ApiService, private caller: CallNumber, private alert: AlertController, private database: LocalDatabaseService) { }

  ngOnInit() {    
    this.queueForApplicationSettings();
  }

  currentTabIndex = 0;
  onTabClick(event, index){
    var tabs = document.getElementsByClassName('media-tab');
    Array.prototype.forEach.call(tabs, function(tab: HTMLElement){
      // tab.setAttribute('disabled', 'true');
      if(tab.classList.contains('tab-active')) tab.classList.remove('tab-active');
    })
    var elem = event.target as HTMLElement;
    elem.classList.add('tab-active');

    setTimeout(()=>{
      this.changeTabIndex(index);
    }, 50);
  }

  onRefresh(event){
    this.onQueue = false;
    this.queueForApplicationSettings(event);
  }

  private changeTabIndex(index){
    this.currentTabIndex = index;
    if(index == 0){
      console.log('index = 0');      
      this.initializeFacebook();
    }
    else if(index == 1){
      //twitter
      if(!this.hasLoadedTwitter){
        this.initializeTwitter();
      }
      else{
        this.reloadTwitter();
      }
    }
  }

  facebookContainer = undefined;
  private async initializeFacebook(){ 
    setTimeout(()=>{
      var mediaContent = document.getElementsByClassName('media-content')[0] as HTMLElement;
      var encodedUri = encodeURIComponent(this.urlFacebook);
      console.log(encodedUri);
      
      var width = Math.min(mediaContent.offsetWidth, 500);
      var height = 1000;
      
      mediaContent.innerHTML = '<iframe src="https://www.facebook.com/plugins/page.php?href='+encodedUri+'&tabs=timeline&width='+width+'&height='+height+'&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" width="'+width+'" height="'+height+'" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>';

    }, 300);
  }

  private initializeTwitter(){
    var mediaContent = document.getElementsByClassName('media-content')[0] as HTMLElement;
    mediaContent.innerHTML = '';

    var twitterElem = document.createElement('a') as HTMLElement;
    twitterElem.classList.add('twitter-timeline');
    twitterElem.setAttribute('href', this.urlTwitter+'?ref_src=twsrc%5Etfw');
    
    var mediaContent = document.getElementsByClassName('media-content')[0] as HTMLElement;   
    mediaContent.appendChild(twitterElem);

    var twitterScript = document.createElement('script');
    twitterScript.id = 'twitter-script';
    twitterScript.async = true;
    twitterScript.src = 'https://platform.twitter.com/widgets.js';

    var headElem = document.getElementsByTagName('head')[0];
    headElem.appendChild(twitterScript);

    this.hasLoadedTwitter = true;
  }

  private reloadTwitter(){
    var twitterScript = document.getElementById('twitter-script');
    twitterScript.remove();

    this.initializeTwitter();
  }


  external_link = '';
  contact_name = '';
  contact_number = '';
  urlTwitter = '';
  urlFacebook = '';
  onQueue = true;
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
  private queueForApplicationSettings(event?){
    this.apiService.getApplicationSetting([ApplicationSetting.facebook, ApplicationSetting.twitter, ApplicationSetting.contact_name, ApplicationSetting.contact_number, ApplicationSetting.hamburger_menu_external_link]).subscribe(
      (data) => {
        this.contact_name = data['acf'].contact_name;
        this.contact_number = data['acf'].contact_number;
        this.external_link = data['acf'].hamburger_menu_external_link;
        this.urlFacebook = data['acf'].facebook;
        this.urlTwitter = data['acf'].twitter;
        console.log(this.urlTwitter);
        
      },
      (error) => {
        this.onQueue = false;
      },
      () => {
        this.onQueue = false;
        console.log('complete');

        if(event != undefined){
          setTimeout(()=>{
            event.target.complete();
            this.changeTabIndex(this.currentTabIndex);
          }, 300);
        }
        else this.changeTabIndex(this.currentTabIndex);
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
