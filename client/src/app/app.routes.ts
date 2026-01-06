
import { Routes } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
// Use the new status component for customers
import { QueueStatusComponent } from './components/queue-status/queue-status';
import { LoginComponent } from './components/login/login';
import { LandingComponent } from './components/landing/landing';
import { ReservationComponent } from './components/reservation/reservation';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard';

import { CustomerHomeComponent } from './components/customer-home/customer-home';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        pathMatch: 'full',
        canActivate: [roleGuard],
        data: { roles: ['Customer', ''] }
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'home',
        component: LandingComponent,
        canActivate: [roleGuard],
        data: { roles: ['Customer', ''] }
    },
    {
        path: 'tables',
        component: TableListComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'queue',
        component: QueueStatusComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'reservation',
        component: ReservationComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Customer'] }
    },
    {
        path: 'manager',
        component: ManagerDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Manager'] }
    }
];
