import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule , ReactiveFormsModule} from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidemenuComponent } from './layout/sidemenu/sidemenu.component';
import { FooterComponent } from './layout/footer/footer.component';
import { BackTopComponent } from './layout/back-top/back-top.component';
import { BreadcrumbComponent } from './layout/breadcrumb/breadcrumb.component';
import { HomeComponent } from './home/home.component';



import { routing } from './app.routing';
import { SharedModule } from './shared/shared.module';
import { BannerComponent } from './banner/banner.component';
import { BlogComponent } from './blog/blog.component';
import { DealsComponent } from './deals/deals.component';
 import { ProductComponent } from './product/product.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { AppConfig } from './app.config';
import { NavbarService } from './navbar.service';
import { LoginComponent } from './login/login.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { ProductsComponent } from './products/products.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PlacedOrdersComponent } from './placed-orders/placed-orders.component';
import { PaginatorModule } from 'primeng/paginator';
import { RegisterComponent } from './register/register.component';
import {  TruncatePipe }   from './pipes/limitto';
import {  currencyConversionPipe }   from './pipes/currencyConversion';
import {  categoriesCountPipe }   from './pipes/categoriesCount';

import {RatingModule} from 'primeng/rating';
import {SliderModule} from 'primeng/slider';
// import { BestsellersComponent } from './bestsellers/bestsellers.component';
import { LatestTrendingComponent } from './latest-trending/latest-trending.component';
import { PopularProductsComponent } from './popular-products/popular-products.component';
import { PaymentComponent } from './components/payment/payment.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { MyaddressessComponent } from './myaddressess/myaddressess.component';
import { MywishlistComponent } from './mywishlist/mywishlist.component';
import { MyorderhistoryComponent } from './myorderhistory/myorderhistory.component';
import { SellerpageComponent } from './sellerpage/sellerpage.component';
import { MerchantDetailsComponent } from './merchant-details/merchant-details.component';
import { ShippingRatesComponent } from './shipping-rates/shipping-rates.component';
import { SupportComponent } from './support/support.component';
import { TableModule } from 'primeng/table';
 import { DirectivesModule } from './layout/directives/directives.module';
import { ProductsByCategoriesComponent } from './products-by-categories/products-by-categories.component';
import { PolicyComponent } from './policy/policy.component';
import { ReturnPolicyComponent } from './return-policy/return-policy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { FaqsComponent } from './faqs/faqs.component';
@NgModule({
  declarations: [
   
    AppComponent,
    NavbarComponent,
    SidemenuComponent,
    FooterComponent,
    BackTopComponent,
    BreadcrumbComponent,
    HomeComponent,
    BannerComponent,
    BlogComponent,
    DealsComponent,
    ProductDetailsComponent,
     ProductComponent,
    LoginComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    ProductsComponent,
    PlacedOrdersComponent,
    RegisterComponent,
    TruncatePipe,
    currencyConversionPipe,
    categoriesCountPipe,
    // BestsellersComponent,
    LatestTrendingComponent,
    PopularProductsComponent,
    PaymentComponent,
    MyaccountComponent,
    MyaddressessComponent,
    MywishlistComponent,
    MyorderhistoryComponent,
    SellerpageComponent,
    MerchantDetailsComponent,
    ShippingRatesComponent,
    SupportComponent,
    // AboutUsComponent,
    ProductsByCategoriesComponent,
    PolicyComponent,
    ReturnPolicyComponent,
    TermsAndConditionsComponent,
    AboutUsComponent,
    FaqsComponent
  ],
  imports: [
    BrowserModule,
    routing,
    SharedModule,
    FormsModule,
    RatingModule,
    SliderModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({ 
      timeOut: 2000,
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    AutoCompleteModule,
    PaginatorModule,
    TableModule,
    DirectivesModule
  ],
  providers: [AppConfig,NavbarService],
  bootstrap: [AppComponent]
})
export class AppModule { }
