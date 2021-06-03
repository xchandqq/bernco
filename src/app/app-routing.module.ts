import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'articles',
    loadChildren: () => import('./articles/articles.module').then( m => m.ArticlesPageModule)
  },
  {
    path: 'policy',
    loadChildren: () => import('./policy/policy.module').then( m => m.PolicyPageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./terms/terms.module').then( m => m.TermsPageModule)
  },
  {
    path: 'search-article',
    loadChildren: () => import('./search-article/search-article.module').then( m => m.SearchArticlePageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule)
  },
  {
    path: 'resource-categories',
    loadChildren: () => import('./resource-categories/resource-categories.module').then( m => m.ResourceCategoriesPageModule)
  },
  {
    path: 'resources-by-category',
    loadChildren: () => import('./resources-by-category/resources-by-category.module').then( m => m.ResourcesByCategoryPageModule)
  },
  {
    path: 'location',
    loadChildren: () => import('./location/location.module').then( m => m.LocationPageModule)
  },
  {
    path: 'saved-articles',
    loadChildren: () => import('./saved-articles/saved-articles.module').then( m => m.SavedArticlesPageModule)
  },
  {
    path: 'single-article',
    loadChildren: () => import('./single-article/single-article.module').then( m => m.SingleArticlePageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'media',
    loadChildren: () => import('./media/media.module').then( m => m.MediaPageModule)
  },
  {
    path: 'resource',
    loadChildren: () => import('./resource/resource.module').then( m => m.ResourcePageModule)
  },
  {
    path: 'search-screen',
    loadChildren: () => import('./search-screen/search-screen.module').then( m => m.SearchScreenPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
