import { LocalDatabaseService } from './../serv/local-database.service';
import { IonContent, IonInfiniteScroll, IonRouterOutlet, MenuController, AlertController, Platform, NavController } from '@ionic/angular';
import { Article, ArticleService } from './../serv/article-service.service';
import { ApiService, ApplicationSetting } from './../serv/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-single-article',
  templateUrl: './single-article.page.html',
  styleUrls: ['./single-article.page.scss'],
})
export class SingleArticlePage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  onQueue = true;
  onQueueFromRefresh = false;
  onQueueFromLoad = false;
  canBookmark = false;

  onQueueRelatedArticles = false;
  hasLoadedRelatedArticles = false;

  id;
  article: Article = undefined;
  relatedArticles: Article[] = [];

  constructor(private platform: Platform, private caller: CallNumber, private alert: AlertController, private menu: MenuController, private articleService: ArticleService, private database: LocalDatabaseService, private router: Router, private route: ActivatedRoute, private apiService: ApiService, private routerOutlet: IonRouterOutlet) { }


  ngOnInit() {
    var hasId = this.route.snapshot.queryParamMap.has('id');
    if(hasId){
      this.id = this.route.snapshot.queryParamMap.get('id');
      this.queueForSingleArticle();
    }
    else{
      this.router.navigateByUrl('/articles');
      return;
    }
  }

  ionViewDidEnter(){
    this.menu.enable(false);
    this.routerOutlet.swipeGesture = false;
  }
  ionViewDidLeave(){
    this.menu.enable(true);
    this.routerOutlet.swipeGesture = true;
  }

  endQueue(event?){
    if(event != undefined){
      event.target.complete();
    }

    this.onQueue = false;
    this.onQueueFromLoad = false;
    this.onQueueFromRefresh = false;
  }

  private queueForSingleArticle(event?){
    this.apiService.getSingleArticle(this.id).subscribe(
      (data) =>{
        this.article = this.articleService.parseArticle(data);
        this.canBookmark = this.database.canBookmark();
        if(this.database.canBookmark()){
          this.article.bookmarked = this.database.isArticleBookmarked(this.article);
        }
      },
      (error) => {
        this.endQueue(event);
      },
      () => {
        this.endQueue(event);
      }
    );
    
    this.queueForApplicationSettings();
  }

  private queueForRelatedArticles(event?){
    this.onQueueRelatedArticles = true;
    this.apiService.getRelatedArticles(this.article).subscribe(
      (data: any[]) =>{
        this.relatedArticles = [];
        for(var d of data){
          var article = this.articleService.parseArticle(d);
          if(this.database.canBookmark()){
            article.bookmarked = this.database.isArticleBookmarked(article);
          }
          this.relatedArticles.push(article);
        }
      },
      (error) => {
        this.onQueueRelatedArticles = false;
        if(event != undefined) event.target.complete();
      },
      () => {
        this.hasLoadedRelatedArticles = true;
        this.onQueueRelatedArticles = false;
        if(event != undefined) event.target.complete();
        setTimeout(()=>{
          this.onScroll(undefined);
        }, 50);
      }
    )
  }

  // events
  onRefresh(event){
    this.onQueueFromRefresh = true;
    this.queueForSingleArticle(event);
  }  

  onBookmark(article: Article){
    article.bookmarked = !article.bookmarked;
    this.database.bookmarkArticle(article);
  }

  onRelatedArticle(article: Article){
    this.content.scrollToTop(500);

    this.router.navigateByUrl('/single-article?id=' + article.id);
    this.id = article.id;

    this.article = article;

    this.queueForRelatedArticles();
  }

  onLoadRelated(event){
    if(!this.hasLoadedRelatedArticles){
      this.queueForRelatedArticles(event);
    }
  }

  onScroll(event){
    var scrollElem = document.getElementById('related-article-scroll');
    var scrollX = scrollElem.scrollLeft;
    var centerX = scrollElem.parentElement.offsetWidth / 2;
    var children = scrollElem.getElementsByClassName('article-related-window');
    Array.prototype.forEach.call(children, function(child: HTMLElement){
      var elementCenterX = child.offsetLeft + 115; 
      var distance = elementCenterX - (scrollX + centerX);
      // var scaleOffset = Math.max(((Math.abs(distance) - 115)/400), 0);
      // var scale = Math.max(1 - scaleOffset, 0.7);
      var scale = Math.abs(distance) > 115 ? 0.7 : 1;
      
      // if(scale < 1) scale = 0.7;

      child.style.transform = 'scale('+scale+')';
      child.style.opacity = scale.toString();
    });
    
  }



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
    this.apiService.getApplicationSetting([ApplicationSetting.contact_name, ApplicationSetting.contact_number]).subscribe(
      (data) => {
        this.contact_name = data['acf'].contact_name;
        this.contact_number = data['acf'].contact_number;
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
