import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Router } from '@angular/router';
import { LocalDatabaseService } from './../serv/local-database.service';
import { Platform, AlertController } from '@ionic/angular';
import { Article, ArticleCategory, ArticleService } from './../serv/article-service.service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-saved-articles',
  templateUrl: './saved-articles.page.html',
  styleUrls: ['./saved-articles.page.scss'],
})
export class SavedArticlesPage implements OnInit {

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;
  onQueueCategories = false;

  isEmpty = true;

  postPerPage = 5;
  page = 1;
  maxPages;
  articles: Article[] = [];
  categories: ArticleCategory[] = [];

  searchMode = false;
  searchKeyword = '';

  constructor(private caller: CallNumber, private alert: AlertController, private platform: Platform, private database: LocalDatabaseService, private router: Router, private apiService: ApiService, private articleService: ArticleService) { }

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
            this.queueForArticles();
          })
        }
        else this.queueForArticles();
      }
    );
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromLoad = false;
    this.onQueueFromRefresh = false;
    this.onQueueCategories = false;
  }

  // queue
  private queueForArticles(event?){
    var ids = this.database.getBookmarkedArticleIds();
    this.isEmpty = ids.length==0;
    
    if(!this.isEmpty){
      this.onNoConnection = false;
      this.onQueueCategories = true;

      this.apiService.getSavedArticles(ids, this.postPerPage, this.page).subscribe(
        (data) => {
          this.maxPages = data['headers'].get('X-WP-TotalPages');
          if(this.onQueueFromRefresh){
            this.articles = [];
          }
          for(let d of data['body']){
            let article = this.articleService.parseArticle(d);
            article.bookmarked = true;
            console.log(article);
            this.articles.unshift(article);
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
      )
    }
    else{
      this.endQueue(event);
    }
    
    this.queueForApplicationSettings();
  }

  private queueForCategories(){
    this.onNoConnection = false;
    this.apiService.getCategories().subscribe(
      (data: any[]) => {
        this.categories = [];
        for(let d of data){
          var category = {
            id: d.id,
            name: d.name
          };
          this.categories.push(category);
        }
      },
      (error) => {
        if(error.status == 0) this.onNoConnection = true;
        this.endQueue();
      },
      () => {
        this.endQueue();
      }
    )
  }

  // events
  onRefresh(event){
    this.page = 1;
    this.onQueueFromRefresh = true;
    this.queueForArticles(event);
  }

  toggleSearchMode(event){
    this.searchMode = !this.searchMode;
    if(this.searchMode){
      this.queueForCategories();
    }
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
    
    if(!article.bookmarked){
      this.articles.forEach((value,index)=>{
          if(value.id==article.id){
            this.articles.splice(index,1);
            this.isEmpty = this.articles.length == 0;
          }
      });
    }
  }

  onSearch($event){
    console.log('searching '+this.searchKeyword);
    this.router.navigateByUrl('/search-article?keyword='+this.searchKeyword);
  }

  onCategorySelect(category: ArticleCategory){
    console.log(category.name);
    this.router.navigateByUrl('/search-article?categoryId='+category.id+'&categoryName='+category.name);    
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
    this.apiService.getApplicationSetting([ApplicationSetting.hamburger_menu_external_link, ApplicationSetting.contact_name, ApplicationSetting.contact_number]).subscribe(
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
