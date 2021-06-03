import { Article } from './article-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private applicationSettingURL;
  private databaseURL;

  constructor(private httpClient: HttpClient) {
    this.applicationSettingURL = 'http://165.227.77.119/bernalillo/wp-json/acf/v3/options/options?';
    this.databaseURL = 'http://165.227.77.119/bernalillo/wp-json/wp/v2/';
  }

  public getApplicationSetting(options: ApplicationSetting[]): Observable<Object>{
    var url = this.applicationSettingURL + '_fields=';
    for(var opt of options){
      switch(opt){
        case ApplicationSetting.icon:
          url += 'acf.logo,';
          break;          
        case ApplicationSetting.title:
          url += 'acf.upper_title,';
          break;          
        case ApplicationSetting.subtitle:
          url += 'acf.lower_title,';
          break; 
        case ApplicationSetting.externalLogo:
          url += 'acf.hamburger_menu_cta_logo,';
          break; 
        case ApplicationSetting.externalUrl:
          url += 'acf.hamburger_menu_cta_link,';
          break;
        case ApplicationSetting.privacy:
          url += 'acf.privacy_policy,';
          break;
        case ApplicationSetting.terms:
          url += 'acf.terms_and_conditions,';
          break;
        case ApplicationSetting.contact_name_1:
          url += 'acf.contact_name_1,';
          break;
        case ApplicationSetting.contact_name_2:
          url += 'acf.contact_name_2,';
          break;
        case ApplicationSetting.contact_number_1:
          url += 'acf.contact_number_1,';
          break;
        case ApplicationSetting.contact_email_1:
          url += 'acf.contact_email_1,';
          break;
        case ApplicationSetting.contact_number_a:
          url += 'acf.contact_number_a,';
          break;
        case ApplicationSetting.contact_number_b:
          url += 'acf.contact_number_b,';
          break;
        case ApplicationSetting.contact_number_c:
          url += 'acf.contact_number_c,';
          break;
        case ApplicationSetting.contact_title_1:
          url += 'acf.contact_title_1,';
          break;
        case ApplicationSetting.contact_title_2:
          url += 'acf.contact_title_2,';
          break;
        case ApplicationSetting.contact_title_3:
          url += 'acf.contact_title_3,';
          break;
        case ApplicationSetting.contact_address_1:
          url += 'acf.contact_address_1,';
          break;
        case ApplicationSetting.contact_name:
          url += 'acf.contact_name,';
          break;
        case ApplicationSetting.contact_number:
          url += 'acf.contact_number,';
          break;
        case ApplicationSetting.hamburger_menu_external_link:
          url += 'acf.hamburger_menu_external_link,';
          break;
          
        case ApplicationSetting.facebook:
          url += 'acf.facebook,';
          break;
          
        case ApplicationSetting.twitter:
          url += 'acf.twitter,';
          break;
          
        case ApplicationSetting.instagram:
          url += 'acf.instagram,';
          break;
      }
    }
    console.log(url);
    return this.httpClient.get(url);
  }

  public getArticles(postPerPage: number, page: number): Observable<Object>{
    var url = this.databaseURL + 'articles?_embed&per_page=' + postPerPage + '&page=' + page;
    console.log(url);    
    return this.httpClient.get(url, {observe: "response"});
  }

  public getSingleArticle(id): Observable<Object>{
    var url = this.databaseURL + 'articles/' + id + '?_embed';
    console.log(url);
    return this.httpClient.get(url);    
  }

  public getRelatedArticles(article: Article): Observable<Object>{
    var url = this.databaseURL + 'articles?_embed&per_page=10&page=1&categories='+article.categoryIds.map(x=>x.toString()).join(',')+'&exclude='+article.id;
    console.log(url);
    return this.httpClient.get(url);    
  }

  public getSavedArticles(ids: number[], postPerPage: number, page: number): Observable<Object>{    
    var idString = ids.map(x=>x.toString()).join(',');
    var url = this.databaseURL + 'articles?_embed&orderby=include&per_page=' + postPerPage + '&page=' + page + '&include='+idString;
    console.log(url);    
    return this.httpClient.get(url, {observe: "response"});
  }

  public getSearchedArticlesByKeyword(keyword: string, postPerPage: number, page: number): Observable<Object>{
    // search?type=post&subtype=articles&per_page=5&page=1&search=test
    var url = this.databaseURL + 'search?type=post&subtype=articles&per_page=' + postPerPage + '&page=' + page + '&search=' + keyword;
    console.log(url);    
    return this.httpClient.get(url, {observe: "response"});
  }

  public getSearchArticlesByIds(ids: number[]){
    var url = this.databaseURL + 'articles?_embed&include=' + ids.map(x=>x.toString()).join(',');
    console.log(url);    
    return this.httpClient.get(url);
  }

  public getSearchedArticlesByCategoryId(categoryId: number, postPerPage: number, page: number): Observable<Object>{
    var url = this.databaseURL + 'articles?_embed&per_page=' + postPerPage + '&page=' + page + '&categories=' + categoryId;
    console.log(url);    
    return this.httpClient.get(url, {observe: "response"});
  }

  public getCategories(): Observable<Object>{
    var url = this.databaseURL + 'categories?';
    console.log(url);    
    return this.httpClient.get(url);
  }

  public getEvents(postPerPage: number, page: number): Observable<Object>{
    var url = this.databaseURL + 'events?_embed&per_page=' + postPerPage + '&page=' + page;
    console.log(url);    
    return this.httpClient.get(url, {observe: 'response'});
  }

  public getResourceCategories(postPerPage: number, page: number): Observable<Object>{
    var url = this.databaseURL + 'resource-categories?orderby=name&order=asc&per_page=' + postPerPage + '&page=' + page;
    console.log(url);    
    return this.httpClient.get(url, {observe: 'response'});
  }

  public getResourceCategoriesByKeyword(keyword: string, postPerPage: number, page: number): Observable<Object>{
    var url = this.databaseURL + 'resource-categories?orderby=name&order=asc&per_page=' + postPerPage + '&page=' + page + '&search=' + keyword;
    console.log(url);    
    return this.httpClient.get(url, {observe: 'response'});
  }

  public getResourcesByCategory(categoryId: number, postPerPage: number, page: number, filtered: boolean, lat: number, lng: number): Observable<Object>{
    var url = this.databaseURL + 'resources?_embed&orderby=title&order=asc&per_page=' + postPerPage + '&page=' + page + '&resource-categories=' + categoryId;
    if(filtered) url = this.databaseURL + 'resources?_embed&resource-categories=' + categoryId;
    console.log(url);    
    return this.httpClient.get(url, {observe: 'response'});
  }

  public getSingleResource(id: number): Observable<Object>{
    var url = this.databaseURL + 'resources/' + id + '?_embed';
    console.log(url);
    return this.httpClient.get(url);
  }
}

export enum ApplicationSetting{
  icon,
  title,
  subtitle,
  externalLogo,
  externalUrl,
  privacy,
  terms,
  contact_name_1,
  contact_name_2,
  contact_number_1,
  contact_email_1,
  contact_number_a,
  contact_number_b,
  contact_number_c,
  contact_title_1,
  contact_title_2,
  contact_title_3,
  contact_address_1,
  contact_name,
  contact_number,
  hamburger_menu_external_link,
  facebook,
  twitter,
  instagram
}