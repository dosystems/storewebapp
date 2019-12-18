export const menuItems = [
  {
    title: 'Dashboard',
    routerLink: '/dashboard',
    icon: 'fa fa-dashboard',
    selected: false,
    expanded: false,
    order: 0
  },
     {
     title: 'Settings',
     routerLink: '/settings',
     icon: 'fa fa-cog',
     selected: false,
     expanded: false,
     order: 15,
    subMenu: [
      {
        title: 'Settings',
        routerLink: '/settings'
      },
      {
        title: 'Admin Settings',
        routerLink:'/addsettings'
      }   
    ] 
   } ,
  {
    title: 'Employees',
    routerLink: '/employee',
    icon: 'fa fa-users',
    selected: false,
    expanded: false,
    order: 1
  },
  {
    title: 'Orders',
    routerLink: '/orders',
    icon: 'fa fa-shopping-cart',
    selected: false,
    expanded: false,
    order: 2
  },
  {
    title: 'Categories',
    routerLink: '/categories',
    icon: 'fa fa-sitemap',
    selected: false,
    expanded: false,
    order: 3
  },
  {
    title: 'Products',
    routerLink: '/products',
    icon: 'fa fa-product-hunt',
    selected: false,
    expanded: false,
    order: 4,
    subMenu: [
      {
        title: 'Products',
        routerLink: '/products'
      },
      {
        title: 'Products Ordered',
        routerLink: '/productsordered'
      },      
      {
        title: 'Most Viewed',
        routerLink: '/reports/mostviewed'
      }
    ]
  },
  {
    title: 'Attributes',
    routerLink: '/attributes',
    icon: 'fa fa-file',
    selected: false,
    expanded: false,
    order: 6
  },
  {
    title: 'Activities',
    routerLink: '/activities',
    icon: 'fa fa-anchor',
    selected: false,
    expanded: false,
    order: 5
  },

  {
    title: 'Users',
    routerLink: 'users',
    icon: 'fa fa-users',
    selected: false,
    expanded: false,
    order: 7,
    subMenu: [
      {
        title: 'Customers',
        routerLink: '/buyers'
      },
      {
        title: 'Merchants',
        routerLink: '/sellers'
      },
      {
        title: 'Best Sellers',
        routerLink: '/reports/bestsellers'
      },
    ]

  },

   {
     title: 'Tickets',
     routerLink: '/tickets',
     icon: 'fa fa-ticket',
     selected: false,
     expanded: false,
     order: 9
   },
  {
    title: 'Announcements',
    routerLink: '/announcement',
    icon: 'fa fa-bullhorn',
    selected: false,
    expanded: false,
    order: 10
  },
  {
    title: 'Brands',
    routerLink: '/brands',
    icon: 'fa fa-university',
    selected: false,
    expanded: false,
    order: 11
  },
  {
    title: 'Reviews',
    routerLink: '/reports/reviews',
    icon: 'fa fa-comments',
    selected: false,
    expanded: false,
    order: 11
  },
  {
    title: 'Subscription Plans',
    routerLink: '/plans',
    icon: 'fa fa-money',
    selected: false,
    expanded: false,
    order: 12
  },
  {
    title: 'Subscribers',
    routerLink: '/subscriptions',
    icon: 'fa fa-users',
    selected: false,
    expanded: false,
    order: 13
  },
  {
    title: 'News Letters',
    routerLink: '/newsletters',
    icon: 'fa fa-newspaper-o',
    selected: false,
    expanded: false,
    order: 13
  } ,
  //  {
  //    title: 'Payments Summary',
  //    routerLink: '/incomeandexpences',
  //    icon: 'fa fa-money',
  //    selected: false,
  //    expanded: false,
  //    order: 14
  //  },
   {
     title: 'Currency Conversion',
     routerLink: '/exchangerates',
     icon: 'fa fa-money',
     selected: false,
     expanded: false,
     order: 15
   },
   {
     title: 'Promo Codes',
     routerLink: '/promocodes',
     icon: 'fa fa-money',
     selected: false,
     expanded: false,
     order: 16
   }     
];
