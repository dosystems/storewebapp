import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateStaticLoader, TranslateLoader, TranslateService } from 'ng2-translate';


// AoT requires an exported function for factories
export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  imports: [
    HttpModule,
    CommonModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http]
    })
  ],
  exports: [
    CommonModule,
    TranslateModule
  ]
})
export class SharedModule {
  public http: Http;
  constructor(private translate: TranslateService, http: Http) {
    this.http = http;

    translate.addLangs(["en", "fr", "den"]);
    translate.setDefaultLang('en');

    let browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr|den/) ? browserLang : 'en');


  }

}
