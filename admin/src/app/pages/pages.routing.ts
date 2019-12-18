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
            { path: 'categories', loadChildren: 'app/pages/categories/categories.module#CategoriesModule' },
            { path: 'addProduct', loadChildren: 'app/pages/add-product/add-product.module#AddProductModule' },
            { path: 'addnewproduct', loadChildren: 'app/pages/add-new-product/add-new-product.module#AddNewProductModule' },
            { path: 'editproduct/:productId', loadChildren: 'app/pages/add-new-product/add-new-product.module#AddNewProductModule' },
            { path: 'copyproduct/:copyProductId', loadChildren: 'app/pages/add-new-product/add-new-product.module#AddNewProductModule' },
            { path: 'product/:id', loadChildren: 'app/pages/add-product/add-product.module#AddProductModule' },
            { path: 'products', loadChildren: 'app/pages/products/products.module#ProductsModule' },
            { path: 'activities', loadChildren: 'app/pages/activity/activity.module#ActivityModule' },
            { path: 'buyers', loadChildren: 'app/pages/buyers/buyers.module#BuyersModule' },
            { path: 'sellers', loadChildren: 'app/pages/sellers/sellers.module#SellersModule' },
            { path: 'incomeandexpences', loadChildren: 'app/pages/income-and-expences/income-and-expences.module#IncomeAndExpencesModule' },
            { path: 'tickets', loadChildren: 'app/pages/tickets/tickets.module#TicketsModule' },
            { path: 'announcement', loadChildren: 'app/pages/anouncements/anouncements.module#AnouncementsModule' },
            { path: 'attributes', loadChildren: 'app/pages/attributes/attributes.module#AttributesModule' },
            { path: 'brands', loadChildren: 'app/pages/brands/brands.module#BrandsModule' },
            { path: 'plans', loadChildren: 'app/pages/searchplans/searchplans.module#SearchplansModule' },
            { path: 'subscriptions', loadChildren: 'app/pages/subscriptions/subscriptions.module#SubscriptionsModule' },
            { path: 'newsletters', loadChildren: 'app/pages/newsletter/newsletter.module#NewsletterModule' },
            { path: 'productsordered', loadChildren: 'app/pages/productsordered/productsordered.module#ProductsorderedModule' },
            { path: 'reports/:reportType', loadChildren: 'app/pages/reports/reports.module#ReportsModule' },
            { path: 'exchangerates', loadChildren: 'app/pages/exchangerates/exchangerates.module#ExchangeratesModule' },
            { path: 'details/:Type', loadChildren: 'app/pages/detailspage/detailspage.module#DetailspageModule' },
            { path: 'settings', loadChildren: 'app/pages/settings/settings.module#SettingsModule' },
            { path: 'productdetails', loadChildren: 'app/pages/productdetails/productdetails.module#ProductdetailsModule' },
            { path: 'addsettings', loadChildren: 'app/pages/add-settings/add-settings.module#AddSettingsModule' },
            { path: 'promocodes', loadChildren: 'app/pages/promocodes/promocodes.module#PromocodesModule' },
           // { path: 'editsettings/:settingsId', loadChildren: 'app/pages/add-settings/add-settings.module#AddSettingsModule' }
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);