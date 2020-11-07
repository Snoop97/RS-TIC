import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule} from "@angular/router";

//importar componentes
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from "./components/home/home.component";
import { UserEditComponent } from "./components/user-edit/user-edit.component";
import { UsersComponent } from "./components/users/users.component";
import {ChartComponent} from "./components/report/chart.component";

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'registro', component: RegisterComponent},
  {path: 'mis-datos', component: UserEditComponent},
  {path: 'persona', component: UsersComponent},
  {path: 'persona/:page', component: UsersComponent},
  {path: '**', component: HomeComponent},
  {path: 'chart', component: ChartComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);

