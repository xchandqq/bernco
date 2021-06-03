import { ApiService, ApplicationSetting } from './serv/api.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  
  private mainNavigationItems: NavigationItem[] = [];
  private subNavigationItems: NavigationItem[] = [];

  constructor(private apiService: ApiService, private router: Router, private menu: MenuController) {}
  onQueue = true;
  queueError = false;

  logoUrl: string;
  title: string;
  subtitle: string;
  externalLinkLogo: string;
  externalLinkUrl: string;

  ngOnInit() {
    this.mainNavigationItems.push({name: 'Articles', icon: 'articles-icon', href: 'articles'});
    this.mainNavigationItems.push({name: 'Saved Articles', icon: 'saved-articles-icon', href: 'saved-articles'});
    this.mainNavigationItems.push({name: 'Upcoming Events', icon: 'events-icon', href: 'events'});
    this.mainNavigationItems.push({name: 'Resources', icon: 'resources-icon', href: 'resource-categories'});
    this.mainNavigationItems.push({name: 'Social Feeds', icon: 'media-icon', href: 'media'});
    this.mainNavigationItems.push({name: 'Contact Us', icon: 'contact-icon', href: 'contact-us'});

    this.subNavigationItems.push({name: 'Privacy Notice', icon: '', href: 'policy'});
    this.subNavigationItems.push({name: 'Terms and Conditions', icon: '', href: 'terms'});

    this.queueForApplicationSettings();
  }

  // api queue
  private queueForApplicationSettings(){
    this.onQueue = true;
    this.queueError = false;

    this.apiService.getApplicationSetting([
      ApplicationSetting.icon, 
      ApplicationSetting.title, 
      ApplicationSetting.subtitle, 
      ApplicationSetting.externalLogo, 
      ApplicationSetting.externalUrl]).subscribe(
      (data) =>{
        this.logoUrl = data['acf'].logo;
        this.title = data['acf'].upper_title;
        this.subtitle = data['acf'].lower_title;
        this.externalLinkLogo = data['acf'].hamburger_menu_cta_logo;
        this.externalLinkUrl = data['acf'].hamburger_menu_cta_link;
      },
      (error) => {
        // no internet
        this.queueError = true;
        this.onQueue = false;
        
      },
      () => {
        // done
        this.onQueue = false;
      }
    )
  }

  // getters
  public getMainNavigationItems(): NavigationItem[]{
    return this.mainNavigationItems;
  }
  public getSubNavigationItems(): NavigationItem[]{
    return this.subNavigationItems;
  }

  // events
  public onNavClick(href: string){
    this.router.navigate([href]);
    this.menu.close();
  }

  public onOpen(event){
    // this.queueForApplicationSettings();
  }
}

export interface NavigationItem{
  name: string;
  icon: string;
  href: string;
}