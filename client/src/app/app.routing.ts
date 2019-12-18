import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { HomeComponent } from './home/home.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductComponent } from './product/product.component';
import { ProductsComponent } from './products/products.component';
import { PlacedOrdersComponent } from './placed-orders/placed-orders.component';
import { RegisterComponent } from './register/register.component';
import { PaymentComponent } from './components/payment/payment.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { MyaddressessComponent } from './myaddressess/myaddressess.component';
import { MywishlistComponent } from './mywishlist/mywishlist.component';
import { MyorderhistoryComponent } from './myorderhistory/myorderhistory.component';
import { SellerpageComponent } from './sellerpage/sellerpage.component';
import { MerchantDetailsComponent } from './merchant-details/merchant-details.component';
import { ShippingRatesComponent } from './shipping-rates/shipping-rates.component';
import { SupportComponent } from './support/support.component';
import { PolicyComponent } from './policy/policy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ReturnPolicyComponent } from './return-policy/return-policy.component';
import { FaqsComponent } from './faqs/faqs.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'details/:id', component: ProductDetailsComponent, data: { breadcrumb: 'ProductDetails' } },
  { path: 'cart', component: CartComponent, data: { breadcrumb: 'Cart' } },
  { path: 'place-order', component: CartComponent, data: { breadcrumb: 'Place Order' } },
  { path: 'checkout', component: CheckoutComponent, data: { breadcrumb: 'Checkout' } },
  { path: 'product', component: ProductComponent, data: { breadcrumb: 'Product' } },
  { path: 'products', component: ProductsComponent, data: { breadcrumb: 'Products' } },
  { path: 'products/:search', component: ProductsComponent, data: { breadcrumb: 'Products' } },
  { path: 'wishList', component: ProductsComponent, data: { breadcrumb: 'Products' } },
  { path: 'placedOrders', component: PlacedOrdersComponent, data: { breadcrumb: 'PlacedOrders' } },
  { path: 'create', component: RegisterComponent, data: { breadcrumb: 'create Account' } },
  { path: 'changePassword', component: RegisterComponent, data: { breadcrumb: 'changePassword' } },
  { path: 'forgotPassword', component: RegisterComponent, data: { breadcrumb: 'forgotPassword' } },
  { path: 'activateEmail/:id', component: RegisterComponent, data: { breadcrumb: 'activateUser' } },
  { path: 'resetPassword/:key', component: RegisterComponent, data: { breadcrumb: 'resetPassword' } },
  { path: 'payment', component: PaymentComponent, data: { breadcrumb: 'PaymentComponent' } },
  { path: 'myAccount', component: MyaccountComponent, data: { breadcrumb: 'MyDashboard' } },
  { path: 'myaddresses', component: MyaddressessComponent, data: { breadcrumb: 'MyDashboard' } },
  { path: 'myWishList', component: MywishlistComponent, data: { breadcrumb: 'MyDashboard' } },
  { path: 'myorders', component: MyorderhistoryComponent, data: { breadcrumb: 'MyDashboard' } },
  { path: 'merchant', component: SellerpageComponent, data: { breadcrumb: 'Merchant' } },
  { path: 'merchantDetails/:id', component: MerchantDetailsComponent, data: { breadcrumb: 'Seller' } },
  { path: 'shippingRates', component: ShippingRatesComponent, data: { breadcrumb: 'shipping rates' } },
  { path: 'support', component: SupportComponent, data: { breadcrumb: 'support' } },
  { path: 'policy', component: PolicyComponent, data: { breadcrumb: 'policy' } },
  { path: 'terms-conditions', component: TermsAndConditionsComponent, data: { breadcrumb: 'terms-conditions' } },
  { path: 'about-us', component: AboutUsComponent, data: { breadcrumb: 'about-us' } },
  { path: 'return-policy', component: ReturnPolicyComponent, data: { breadcrumb: 'return-policy' } },

  { path: 'faqs', component: FaqsComponent, data: { breadcrumb: 'faqs' } }

  
  
  
  
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
});