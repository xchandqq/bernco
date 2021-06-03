import { Injectable } from '@angular/core';
import { title } from 'process';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor() { }


  private parseDate(date: string): string{
    var month, day, year;
    year = date.substr(0, 4);
    month = date.substr(5, 2);
    day = date.substr(8, 2);

    switch(Number.parseInt(month)){
      case 1:
        month = 'January';
        break;        
      case 2:
        month = 'February';
        break;        
      case 3:
        month = 'March';
        break;        
      case 4:
        month = 'April';
        break;        
      case 5:
        month = 'May';
        break;        
      case 6:
        month = 'June';
        break;        
      case 7:
        month = 'July';
        break;        
      case 8:
        month = 'August';
        break;        
      case 9:
        month = 'September';
        break;        
      case 10:
        month = 'October';
        break;        
      case 11:
        month = 'November';
        break;        
      case 12:
        month = 'December';
        break;
    }

    return month + ' ' + Number.parseInt(day) + ', ' + year;
  }
  public parseArticle(data): Article{
    let article: Article = {
      id: data.id,
      title: data.title.rendered,
      date: this.parseDate(data.date_gmt),

      authorId: data.author,
      authorName: data._embedded.author[0].name,
      authorAvatarUrl: data._embedded.author[0].avatar_urls['24'],
      authorAvatarUrl48: data._embedded.author[0].avatar_urls['48'],

      categoryIds: data.categories,
      categoryNames: [],

      tagIds: data.tags,
      tagNames: [],

      imageId: data.featured_media,
      imageUrl: data._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url,

      content: data.content.rendered,
      bookmarked: false

    };

    for(var i = 0; i<article.categoryIds.length; i++){
      for(var term of data._embedded['wp:term'][0]){
        if(term.id == article.categoryIds[i]){
          article.categoryNames.push(term.name);
        }
      }
    }

    for(var i = 0; i<article.tagIds.length; i++){
      for(var term of data._embedded['wp:term'][1]){
        if(term.id == article.tagIds[i]){
          article.tagNames.push(term.name);
        }
      }
    }

    return article;
  }
}

export interface Article{
  id: number;
  title: string;
  date: string;

  authorId: number;
  authorName: string;
  authorAvatarUrl: string;
  authorAvatarUrl48: string;

  categoryIds: number[];
  categoryNames: string[];

  imageId: number;
  imageUrl: string;

  tagIds: number[];
  tagNames: string[];

  content: string;
  bookmarked: boolean;
}

export interface ArticleCategory{
  id: number,
  name: string
}