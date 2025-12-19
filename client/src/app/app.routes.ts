
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
];
