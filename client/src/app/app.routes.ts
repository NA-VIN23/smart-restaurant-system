
import { Routes } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
// Use the new status component for customers
import { QueueStatusComponent } from './components/queue-status/queue-status';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';
import { ManagerDashboard } from './components/manager-dashboard/manager-dashboard';

import { CustomerHomeComponent } from './components/customer-home/customer-home';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: CustomerHomeComponent },
    { path: 'tables', component: TableListComponent },
    { path: 'queue', component: QueueStatusComponent },
    {
        path: 'manager',
        component: ManagerDashboard,
        canActivate: [authGuard]
    }
];
