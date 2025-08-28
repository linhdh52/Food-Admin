import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withInMemoryScrolling} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {provideHighlightOptions} from 'ngx-highlightjs';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {loadingInterceptor} from "./core/interceptor/loading.interceptor";
import {NgxSpinnerModule} from "ngx-spinner";

const highlightOptions = {
  coreLibraryLoader: () => import('highlight.js/lib/core'),
  languages: {
    typescript: () => import('highlight.js/lib/languages/typescript'),
    scss: () => import('highlight.js/lib/languages/scss'),
    xml: () => import('highlight.js/lib/languages/xml')
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'top'})),
    provideAnimationsAsync(),
    importProvidersFrom([SweetAlert2Module.forRoot()]),
    provideHighlightOptions(highlightOptions),
    importProvidersFrom(
      NgxSpinnerModule.forRoot({type: 'ball-scale-multiple'})
    ),
    provideHttpClient(
      withInterceptors([loadingInterceptor])
    ),
  ],
};
