
import { Routes } from '@angular/router';
import { TableListComponent } from './components/table-list/table-list';
// Use the new status component for customers
import { QueueStatusComponent } from './components/queue-status/queue-status';
import { LoginComponent } from './components/login/login';
import { LandingComponent } from './components/landing/landing';
import { ReservationComponent } from './components/reservation/reservation';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';
import { ManagerDashboard } from './components/manager-dashboard/manager-dashboard';

import { CustomerHomeComponent } from './components/customer-home/customer-home';

export const routes: Routes = [
    { path: '', component: LandingComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: LandingComponent },
    { path: 'tables', component: TableListComponent, canActivate: [authGuard] },
    { path: 'queue', component: QueueStatusComponent, canActivate: [authGuard] },
    { path: 'reservation', component: ReservationComponent, canActivate: [authGuard] },
    {
        path: 'manager',
        component: ManagerDashboard,
        canActivate: [authGuard]
    }
];
