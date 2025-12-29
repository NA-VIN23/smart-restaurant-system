import { Routes } from '@angular/router';
import { TableList } from './features/tables/table-list/table-list';
import { QueueManagement } from './features/queue/queue-management/queue-management';
import { ReservationForm } from './features/reservation/reservation-form/reservation-form';
import { ManagerDashboard } from './features/manager/manager-dashboard/manager-dashboard';
import { Login } from './features/auth/login/login';
import { NotAuthorized } from './features/auth/not-authorized/not-authorized';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Navbar } from './shared/components/navbar/navbar';

export const routes: Routes = [
	{ path: '', redirectTo: 'tables', pathMatch: 'full' },
	{ path: 'tables', component: TableList },
	{ path: 'queue', component: QueueManagement },
	{ path: 'reservation', component: ReservationForm },
	{
		path: 'manager/dashboard',
		component: ManagerDashboard,
		canActivate: [authGuard, roleGuard],
		data: { role: 'Manager' }
	},
	    { path: 'login', component: Login },
	    { path: 'not-authorized', component: NotAuthorized },
	{ path: '**', redirectTo: 'tables' }
];

