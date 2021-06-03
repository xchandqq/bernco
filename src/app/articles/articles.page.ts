import { LocalDatabaseService } from './../serv/local-database.service';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';
import { Article, ArticleService } from '../serv/article-service.service';
import { Router } from '@angular/router';
import { Platform, ToastController, MenuController, AlertController, IonRouterOutlet, NavController, IonSearchbar } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.page.html',
  styleUrls: ['./articles.page.scss'],
})
export class ArticlesPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;
  canBookmark = false;

  postPerPage = 5;
  page = 1;
  maxPages;
  articles: Article[] = [];

  exitConfirmed = false;

  constructor(private nav: NavController, private ionRouter: IonRouterOutlet, private caller: CallNumber, private alert: AlertController, private menu: MenuController, private toast: ToastController, private platform: Platform, private database: LocalDatabaseService, private router: Router, private apiService: ApiService, private articleService: ArticleService) {}

  private onDatabaseError(message: string){
    this.database.enableErrorMode(true);
  }

  ngOnInit() {
    this.platform.ready().then(
      () => {
        var isInit = this.database.isArticlesInitialized();
        var canInit = this.database.canInitialize();

        if(!isInit && canInit){
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
                this.onDatabaseError('Failed to retrieve data');
              })
            })
            .catch((e)=>{
              this.onDatabaseError('Failed to create table');
            })
          })
          .catch((e)=>{
            this.onDatabaseError('Failed to initialize SQLite');
          })
          .finally(()=>{
            this.canBookmark = this.database.canBookmark();
            this.queueForArticles();
          })
        }
        else{          
          this.canBookmark = this.database.canBookmark();
          this.queueForArticles();
        }
      }
    );    

    this.platform.backButton.subscribeWithPriority(10, ()=>{
      if(!this.ionRouter.canGoBack()){   
        var url = this.router.url;
        console.log(url);
        
        if(url == '/articles'){
          if(this.exitConfirmed){          
            navigator['app'].exitApp();
          }
          else{
            this.showExitConfirmation();
          }   
        }
        else{
          this.router.navigateByUrl('/articles', {replaceUrl: true});
        }     

        //else go home page replace url
      }
      else{        
        this.nav.back();
      }
    });
  }

  ngAfterViewInit(){    
  }

  private async showExitConfirmation(){
    this.exitConfirmed = true;
    var timeout = 3000;

    const msg = await this.toast.create({
      message: 'Tap again to exit',
      color: 'medium',
      duration: timeout,
      cssClass: 'raisedToast'
    });
    
    msg.present()
    .then(()=>{
      setTimeout(()=>{
        this.exitConfirmed = false;
      }, timeout);
    });
  }
  
  ionViewDidEnter(){
    for(var article of this.articles){
      article.bookmarked = this.database.isArticleBookmarked(article);
    }
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromLoad = false;
    this.onQueueFromRefresh = false;
  }

  // queue
  private queueForArticles(event?){
    this.onNoConnection = false;
    this.apiService.getArticles(this.postPerPage, this.page).subscribe(
      (data) => {
        this.maxPages = data['headers'].get('X-WP-TotalPages');
        if(this.onQueueFromRefresh){
          this.articles = [];
        }
        for(let d of data['body']){
          let article = this.articleService.parseArticle(d);
          article.bookmarked = this.database.isArticleBookmarked(article);
          console.log(article);
          this.articles.push(article);
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
    this.queueForArticles(event);
  }

  toggleSearchMode(event){
    this.router.navigateByUrl('/search-screen');
  }

  onLoadMore(event){
    this.onQueueFromLoad = true;
    this.queueForArticles(event);
  }

  onArticleClick(article: Article){
    this.router.navigateByUrl('/single-article?id='+article.id);
  }

  onBookmark(article: Article){
    article.bookmarked = !article.bookmarked;
    this.database.bookmarkArticle(article);
  }

  noConnectionMessage = '';
  onNoConnection = false;
  onReconnect(event){
    this.page = 1;
    this.onQueue = true;
    this.queueForArticles();
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
