import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { authGuard } from './shared/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    {path: '', component: HomePageComponent, canActivate: [authGuard] },
    {path: 'login', component: LoginComponent, canActivate: [authGuard] },
];
