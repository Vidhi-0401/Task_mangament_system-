import { Routes } from '@angular/router';
import { LoginComponent } from './views/login.component';
import { TasksComponent } from './views/tasks.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'tasks' },
];
