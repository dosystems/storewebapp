import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { PagesComponent } from './pages.component';
export const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            { path: 'dashboard', loadChildren: 'app/pages/dashboard/dashboard.module#DashboardModule', data: { breadcrumb: 'Dashboard' } },
            {
                path: 'changepassword', loadChildren: 'app/pages/changepassword/changepassword.module#ChangepasswordModule',
                data: { breadcrumb: 'Change Password' }
            },
            { path: 'employee', loadChildren: 'app/pages/employees/employees.module#EmployeesModule' },
            { path: 'orders', loadChildren: 'app/pages/orders/orders.module#OrdersModule' },
            { path: 'orders/returned', loadChildren: 'app/pages/orders/orders.module#OrdersModule' },
            { path: 'orders/orders', loadChildren: 'app/pages/orders/orders.module#OrdersModule' },
            { path: 'categories', loadChildren: 'app/pages/categories/categories.module#CategoriesModule' },
            { path: 'addProduct', loadChildren: 'app/pages/add-product/add-product.module#AddProductModule' },
            //{ path: 'product/:id', loadChildren: 'app/pages/add-product/add-product.module#AddProductModule' },
            { path: 'products', loadChildren: 'app/pages/products/products.module#ProductsModule' },
            { path: 'activities', loadChildren: 'app/pages/activity/activity.module#ActivityModule' },
            { path: 'orderdetails/:id', loadChildren: 'app/pages/orderdetails/orderdetails.module#OrderdetailsModule' },
            { path: 'productdetails', loadChildren: 'app/pages/productdetails/productdetails.module#ProductdetailsModule' },
            { path: 'userdetails/:id', loadChildren: 'app/pages/userdetails/userdetails.module#UserdetailsModule' },
            { path: 'buyers', loadChildren: 'app/pages/buyers/buyers.module#BuyersModule' },
            { path: 'sellers', loadChildren: 'app/pages/buyers/buyers.module#BuyersModule' },
            { path: 'incomeandexpences', loadChildren: 'app/pages/income-and-expences/income-and-expences.module#IncomeAndExpencesModule' },
            { path: 'tickets', loadChildren: 'app/pages/tickets/tickets.module#TicketsModule' },
            { path: 'announcement', loadChildren: 'app/pages/anouncements/anouncements.module#AnouncementsModule' },
            { path: 'attributes', loadChildren: 'app/pages/attributes/attributes.module#AttributesModule' },
            { path: 'reports/:reportType', loadChildren: 'app/pages/reports/reports.module#ReportsModule' },
            { path: 'subscription', loadChildren: 'app/pages/subscription/subscription.module#SubscriptionModule' },
            { path: 'myaccount', loadChildren: 'app/pages/myaccount/myaccount.module#MyaccountModule'},
            { path: 'summary/:type', loadChildren: 'app/pages/summary/summary.module#SummaryModule'},
            { path: 'addnewproduct', loadChildren: 'app/pages/add-new-product/add-new-product.module#AddNewProductModule' },
            { path: 'editproduct/:productId', loadChildren: 'app/pages/add-new-product/add-new-product.module#AddNewProductModule' },
            { path: 'copyproduct/:copyProductId', loadChildren: 'app/pages/add-new-product/add-new-product.module#AddNewProductModule' },
            { path: 'brands', loadChildren: 'app/pages/brands/brands.module#BrandsModule' },
            { path: 'details/:Type', loadChildren: 'app/pages/detailspage/detailspage.module#DetailspageModule' },
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);