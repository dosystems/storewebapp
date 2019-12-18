const mailConfig = {
  mailSettings: {
    // adminUrl: 'http://localhost:4600/',
    // clientUrl: 'http://localhost:4200/',
    // vendorUrl: 'http://localhost:4300/',
    //  pdfUrl: 'http://localhost:5900/pdf/',
    //test srver 
    // adminUrl: 'http://shopadmin.renkomarket.com/',
    // clientUrl: 'http://shop.renkomarket.com/',
    // vendorUrl: 'http://shopvendor.renkomarket.com/',
    // websiteName: 'Bux Super Store',
    // clientLogo: 'http://shop.renkomarket.com/assets/images/buxstorelogo.png',
    // imageUrl: 'http://shopapi.renkomarket.com:5900/entity/s/',
    // pdfUrl: 'http://shopapi.renkomarket.com:5900/pdf/',

    //live server
    adminUrl: 'https://admin.buxsuperstore.com/',
    clientUrl: 'https://buxsuperstore.com/',
    vendorUrl: 'https://vendor.buxsuperstore.com/',
    websiteName: 'Bux Super Store',
    clientLogo: 'https://buxsuperstore.com/assets/images/buxstorelogo.png',
    imageUrl: 'https://api.buxsuperstore.com/entity/s/',
    pdfUrl: 'https://api.buxsuperstore.com/pdf/',

    mailType: 'gmail',
    activateMails: true,
    from: 'Bux Super Store <buxsuperstore@gmail.com>',
    smtpOptions: {
      host: 'smtp.soteria.local',
      port: 25,
      secure: false,
      ignoreTLS: true
    },
    gmailOptions: {
      service: 'Gmail',
      auth: {
        user: 'soteriacontact@gmail.com', // Your email id
        pass: 'Soteria1234$' // Your password
      }
    },
    sesEmailSettings: {
      key: 'xxxxxxxxxxxxxx',
      secret: 'xxxxxxxxxxxxxxxxxxxxxx'
    }
  }
};

export default mailConfig;