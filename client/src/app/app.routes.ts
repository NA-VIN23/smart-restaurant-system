<<<<<<< HEAD
import { Routes } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
import { QueueManagementComponent } from './components/queue-management/queue-management';
import { ReservationComponent } from './components/reservation/reservation';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'tables', pathMatch: 'full' },
	{ path: 'tables', component: TableListComponent },
	{ path: 'queue', component: QueueManagementComponent },
	{ path: 'reservation', component: ReservationComponent },
	{ path: 'manager/dashboard', component: ManagerDashboardComponent, canActivate: [authGuard], data: { roles: ['manager', 'admin'] } },
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'not-authorized', loadComponent: () => import('./components/not-authorized/not-authorized').then(m => m.NotAuthorizedComponent) }
=======

import { Routes } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
import { QueueManagement } from './components/queue-management/queue-management';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';
import { ManagerDashboard } from './components/manager-dashboard/manager-dashboard';

export const routes: Routes = [
    { path: '', redirectTo: '/tables', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'tables', component: TableListComponent },
    { path: 'queue', component: QueueManagement },
    {
        path: 'manager',
        component: ManagerDashboard,
        canActivate: [authGuard]
    }
>>>>>>> origin/main
];
