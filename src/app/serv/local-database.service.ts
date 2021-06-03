import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { Article } from './article-service.service';

@Injectable({
  providedIn: 'root'
})
export class LocalDatabaseService {

  private db: SQLiteObject = undefined;
  private ids: number[] = [];
  private locationData: Location = undefined;
  private facebookCache = undefined;

  private articlesInitialized = false;
  private locationInitialized = false;
  private errorMode: boolean = true;

  locationToast: HTMLIonToastElement = undefined;
  bookmarkToast: HTMLIonToastElement = undefined;

  constructor(private toast: ToastController, private platform: Platform, private sqlite: SQLite) { }

  ngOnInit(): void {
  }

  public hasFacebookOnCache(): boolean{
    return this.facebookCache != undefined;
  }

  public storeFacebookOnCache(fb){
    this.facebookCache = fb;
  }

  public getFacebookOnCache(){
    return this.facebookCache;
  }

  public canInitialize(): boolean{
    return this.sqlite.create({name: 'bern-county.db',location: 'default'}) != undefined;
  }

  public initialize(): Promise<any>{
    console.log('database initializing');
    return this.sqlite.create({name: 'bern-county.db',location: 'default'});
  }

  public createArticlesTable(database: SQLiteObject): Promise<any>{
    return database.executeSql('create table if not exists saved_articles (id INTEGER PRIMARY_KEY, article_id INTEGER)', []);
  }
  
  public createLocationTable(database: SQLiteObject): Promise<any>{
    return database.executeSql('create table if not exists location_data (id INTEGER PRIMARY_KEY, address TEXT, latitude REAL, longitude REAL)', []);
  }

  public retrieveArticlesData(database: SQLiteObject): Promise<any>{
    return database.executeSql('select * from saved_articles', []);
  }

  public retrieveLocationData(database: SQLiteObject): Promise<any>{
    return database.executeSql('select * from location_data', []);
  }

  public finalizeArticlesInitialization(data: any, database: SQLiteObject){
    this.errorMode = false;
    this.db = database;
    const rows = data.rows.length;
    for(let i = 0; i<rows; i++){
      var id = data.rows.item(i).article_id;
      if(this.ids.indexOf(id) == -1) this.ids.push(id);
    }
    console.log('articles database initialized');
  }

  public finalizeLocationInitialization(data: any, database: SQLiteObject){
    this.errorMode = false;
    this.db = database;
    const rows = data.rows.length;
    if(rows > 0){
      this.locationData = {
        address: data.rows.item(rows-1).address,
        latitude: data.rows.item(rows-1).latitude,
        longitude: data.rows.item(rows-1).longitude,
      }
    }
    console.log('location database initialized');
  }

  public isArticlesInitialized(): boolean{
    return this.db != undefined && this.articlesInitialized;
  }

  public isLocationInitialized(): boolean{
    return this.db != undefined && this.locationInitialized;
  }

  public enableErrorMode(error: boolean){
    this.errorMode = error;
  }

  public isErrorMode(): boolean{
    return this.errorMode;
  }

  public canBookmark(): boolean{
    return !this.errorMode;
  }

  public canStoreLocation(): boolean{
    return this.canBookmark();
  }

  public async bookmarkArticle(article: Article){
    if(article.bookmarked){
      this.bookmarkToast = await this.toast.create({
        message: 'Article bookmarked',
        duration: 1500,
        color: 'light',
        cssClass: 'raisedToast'
      });
      this.bookmarkToast.present();

      // add to cache
      this.ids.push(article.id);
      console.log(this.ids);

      // add to database
      this.insertArticleIdToDatabase(article);
    }
    else{
      // remove from cache
      console.log('removing ' + article.id + ' from cache');  
      this.ids = this.ids.filter(x=>x!=article.id);
      console.log(this.ids);
      
      // this.ids.forEach((value,index)=>{
      //     if(value==article.id){
      //       console.log('removing ' + article.id + ' from cache');            
      //       this.ids.splice(index,1);
      //       console.log(this.ids);
            
      //     }
      // });

      // remove from database
      this.deleteArticleIdFromDatabase(article);
    }
  }

  public async storeLocation(location: Location){
    this.locationData = location;
    
    this.locationToast = await this.toast.create({
      message: 'Location saved',
      duration: 1500,
      color: 'light',
      cssClass: 'raisedToast'
    });
    this.locationToast.present();

    if(!this.canStoreLocation()) return;
    // remove all rows
    this.db.executeSql('delete from location_data', [])
    .then(()=>{
      var url = 'insert into location_data (id, address, latitude, longitude) VALUES (?, \'' + location.address + '\', ' + location.latitude + ', ' + location.longitude+ ')';
      console.log(url);      
      this.db.executeSql(url, [])
      .then(()=>{
        // location added
      })
      .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
  }

  public getBookmarkedArticleIds(): number[]{
    return this.ids;
  }

  public hasStoredLocationData(): boolean{
    return this.locationData != undefined;
  }

  public getStoredLocationData(): Location{
    return this.locationData;
  }

  public isArticleBookmarked(article: Article): boolean{
    if(this.errorMode) return false;

    for(var id of this.ids){
      if(article.id == id){
        return true;
      }
    }
    return false;
  }

  private insertArticleIdToDatabase(article: Article){
    this.db.executeSql('insert into saved_articles (id, article_id) VALUES (?, ' + article.id + ')', []).then(
      () => {console.log('inserted article ' + article.id)}
    ).catch(
      (e) => {
        console.log(e);
      }
    );
  }

  private deleteArticleIdFromDatabase(article: Article){
    this.db.executeSql('delete from saved_articles where article_id = ' + article.id, []).then(
      () => {console.log('deleted article ' + article.id);}
    ).catch(
      (e) => {
        console.log(e);
      }
    );
  }
}

export interface Location{
  address: string;
  latitude: number;
  longitude: number;
}