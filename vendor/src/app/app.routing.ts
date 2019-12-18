import { Routes, RouterModule, PreloadAllModules  } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { ErrorComponent } from './pages/error/error.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: 'app/pages/login/login.module#LoginModule' },
  { path: 'registration', loadChildren: 'app/pages/register/register.module#RegisterModule' },
  { path: 'activateEmail/:id',loadChildren: 'app/pages/login/login.module#LoginModule'},
  { path: 'resetPassword/:id',loadChildren: 'app/pages/forgot-password/forgot-password.module#ForgotPasswordModule'},   
  { path: 'forgotpassword', loadChildren: 'app/pages/forgot-password/forgot-password.module#ForgotPasswordModule' },
  { path: '', loadChildren: 'app/pages/pages.module#PagesModule' },
  { path: '**', component: ErrorComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
    // preloadingStrategy: PreloadAllModules,
   // useHash: true
});