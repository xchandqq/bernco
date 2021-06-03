import { Platform, AlertController } from '@ionic/angular';
import { LocalDatabaseService } from './../serv/local-database.service';
import { Article, ArticleService } from './../serv/article-service.service';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-search-article',
  templateUrl: './search-article.page.html',
  styleUrls: ['./search-article.page.scss'],
})
export class SearchArticlePage implements OnInit {

  title = '';

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;
  canBookmark = false;

  postPerPage = 5;
  page = 1;
  maxPages;
  searchResultCount;
  articles: Article[] = [];

  keyword = undefined;
  categoryId = undefined;

  constructor(private caller: CallNumber, private alert: AlertController, private platform: Platform, private database: LocalDatabaseService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, private articleService: ArticleService) { }

  private onDatabaseError(message: string){
    this.database.enableErrorMode(true);
  }

  ngOnInit() {
    console.log(this.route.snapshot.queryParamMap);
    var hasKeyword = this.route.snapshot.queryParamMap.has('keyword');
    var hasCategoryId = this.route.snapshot.queryParamMap.has('categoryId');
    if(hasKeyword || hasCategoryId){
      if(hasKeyword){
        this.keyword = this.route.snapshot.queryParamMap.get('keyword');
        this.title = 'Results for \"' + this.keyword + '\"';
      }
      if(hasCategoryId){
        this.categoryId = this.route.snapshot.queryParamMap.get('categoryId');
        this.title = this.route.snapshot.queryParamMap.get('categoryName') + ' articles';
      }
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
              this.queueForSearchedArticles();
            })
          }
          else{          
            this.canBookmark = this.database.canBookmark();
            this.queueForSearchedArticles();
          }
        }
      );  
    }
    else{
      this.router.navigateByUrl('articles', { replaceUrl: true });
      return;
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

  private queueForSearchedArticlesByKeyword(event?){
    this.onNoConnection = false;
    this.apiService.getSearchedArticlesByKeyword(this.keyword, this.postPerPage, this.page).subscribe(
      (data) => {
        this.maxPages = data['headers'].get('X-WP-TotalPages');
        this.searchResultCount = data['headers'].get('X-WP-Total');
        var ids: number[] = [];
        for(let d of data['body']){
          ids.push(d.id);
        }

        if(ids.length == 0){
          this.endQueue(event);
          return;
        }

        this.apiService.getSearchArticlesByIds(ids).subscribe(
          (data: any[]) => {
            if(this.onQueueFromRefresh){
              this.articles = [];
            }

            for(let d of data){
              let article = this.articleService.parseArticle(d);
              this.articles.push(article);
            }
          },
          (error) => {
            if(error.status == 0) this.onNoConnection = true;
            this.endQueue(event)
          },
          () => {
            this.page++;
            this.endQueue(event);
          }
        )

      },
      (error) => {
        if(error.status == 0) this.onNoConnection = true;
        this.endQueue(event);
      },
      () => {
      }
    );
    this.queueForApplicationSettings();
  }

  private queueForSearchedArticlesByCategoryId(event?){
    this.onNoConnection = false;
    this.apiService.getSearchedArticlesByCategoryId(this.categoryId, this.postPerPage, this.page).subscribe(
      (data) => {
        this.maxPages = data['headers'].get('X-WP-TotalPages');
        this.searchResultCount = data['headers'].get('X-WP-Total');
        if(this.onQueueFromRefresh){
          this.articles = [];
        }
        for(let d of data['body']){
          let article = this.articleService.parseArticle(d);
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
    )
  }

  private queueForSearchedArticles(event?){
    if(this.keyword != undefined) this.queueForSearchedArticlesByKeyword(event);
    else this.queueForSearchedArticlesByCategoryId(event);
  }

  onRefresh(event){
    this.page = 1;
    this.onQueueFromRefresh = true;
    this.queueForSearchedArticles(event);
  }

  onLoadMore(event){
    this.onQueueFromLoad = true;
    this.queueForSearchedArticles(event);
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
    this.queueForSearchedArticles();
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
