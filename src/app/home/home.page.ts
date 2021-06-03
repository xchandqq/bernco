import { Router } from '@angular/router';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { LocalDatabaseService } from './../serv/local-database.service';
import { Component } from '@angular/core';
import { ToastController, Platform, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  onQueue = true;
  onNoConnection = false;

  logoUrl: string;
  title: string;
  subtitle: string;

  errorMessage: string;
  noConnectionMessage: string;

  constructor(private menu: MenuController, private router: Router, private platform: Platform, private toast: ToastController, private database: LocalDatabaseService, private apiService: ApiService) {
    this.menu.enable(false);
  }

  private async setErrorMessage(msg: string){
    console.log(msg);    
    this.database.enableErrorMode(true);
    // toggle error on database

    const toastErrorMessage = await this.toast.create({
      message: 'Bookmark feature is disabled due to errors',
      color: 'danger',
      duration: 5000,
      position: 'bottom'
    });

    toastErrorMessage.present();
  }

  private noInternetConnection(error: any){
    this.onQueue = false;
    this.onNoConnection = true;
    if(error.status == 0){
      this.noConnectionMessage = 'You are not connected to the internet. Make sure your Wifi or Mobile Data is on and try again';
    }
    else{
      this.noConnectionMessage = 'Unknown error occurred. Please try again.';
    }
  }

  ngOnInit(): void {    
    this.platform.ready()
    .then(()=>{
      // check if initialize is possible
      if(this.database.canInitialize()){
        // initialize database
        this.database.initialize()
        .then((db)=>{
          //create table
          this.database.createArticlesTable(db)
          .then(()=>{
            //select data
            this.database.retrieveArticlesData(db)
            .then((value)=>{
              //pass db
              this.database.finalizeArticlesInitialization(value, db);
              // proceed
            })
            .catch((e)=>{
              this.setErrorMessage('Failed to retrieve data');
            })
          })
          .catch((e)=>{
            this.setErrorMessage('Failed to create table');
          })
        })
        .catch((e)=>{
          this.setErrorMessage('Failed to initialize SQLite');
        });
      }
      else this.setErrorMessage('No SQLite available');

      //execute api call
      this.executeApi();
    });
  }

  private executeApi(){
    this.apiService.getApplicationSetting([ApplicationSetting.icon, ApplicationSetting.title, ApplicationSetting.subtitle]).subscribe(
      (data: any[]) => {
        this.logoUrl = data['acf'].logo;
        this.title = data['acf'].upper_title;
        this.subtitle = data['acf'].lower_title;
      },
      (error) =>{
        // display no internet connection
        this.noInternetConnection(error);
      },
      () => {
        this.onQueue = false;
        setTimeout(()=>{
          this.menu.enable(true);
          this.router.navigateByUrl('/articles', {replaceUrl: true});
        }, 3000);
      }
    )
  }

  onReconnect(event){
    this.onQueue = true;
    this.onNoConnection = false;
    this.executeApi();
  }
}
