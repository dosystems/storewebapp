const config = {
  activityConfig: {
    employeeLoginSuccess: {
      context: 'Employee',
      desc: 'Login Successfully',
      contextType: 'Login',
      key: '101'
    },
    employeeLoginFailure: {
      context: 'Employee',
      desc: 'Credentials not matched',
      contextType: 'LoginFail',
      key: '102'
    },
    employeeLogout: {
      context: 'Employee',
      desc: 'Employee logout successfully',
      contextType: 'Logout',
      key: '103'
    },
    employeeChangePassword: {
      context: 'Employee',
      desc: 'Employee password changed successfully',
      contextType: 'ChangePassword',
      key: '104'
    },
    employeeForgotPassword: {
      context: 'Employee',
      desc: 'Employee forgot password send email successfully',
      contextType: 'ForgotPassword',
      key: '105'
    },
    employeeLoginOTP: {
      context: 'Employee',
      desc: 'Login code sent successfully',
      contextType: 'EMPLOYEE',
      key: '106'
    },
    employeeVerifyOTP: {
      context: 'Employee',
      desc: 'Login matched successfully',
      contextType: 'EMPLOYEE',
      key: '107'
    },
    employeeCreate: {
      context: 'Employee',
      desc: 'Employee created',
      contextType: 'Create',
      key: '108'
    },
    employeeUpdate: {
      context: 'Employee',
      desc: 'Employee updated',
      contextType: 'Update',
      key: '109'
    },
    employeeDelete: {
      context: 'Employee',
      desc: 'Employee deleted',
      contextType: 'Delete',
      key: '110'
    },
    productCreate: {
      context: 'Product',
      desc: 'Product created Sucessfully',
      contextType: 'Create',
      key: '251'
    },
    productUpdate: {
      context: 'Product',
      desc: 'Product updated successfully',
      contextType: 'Update',
      key: '252'
    },
    productDelete: {
      context: 'Product',
      desc: 'Product deleted successfully',
      contextType: 'Delete',
      key: '253'
    },
    categoryCreate: {
      context: 'Category',
      desc: 'Category created successfully',
      contextType: 'Create',
      key: '301'
    },
    categoryUpdate: {
      context: 'Category',
      desc: 'Category updated successfully',
      contextType: 'Update',
      key: '302'
    },
    categoryDelete: {
      context: 'Category',
      desc: 'Category deleted successfully',
      contextType: 'Delete',
      key: '303'
    },
    categoryMultiple: {
      context: 'Category',
      desc: 'Multiple categories created successfully',
      contextType: 'Create',
      key: '304'
    },
    orderCreate: {
      context: 'Order',
      desc: 'Order created successfully',
      contextType: 'Create',
      key: '351'
    },
    orderUpdate: {
      context: 'Order',
      desc: 'Order updated successfully',
      contextType: 'Update',
      key: '352'
    },
    orderDelete: {
      context: 'Order',
      desc: 'Order deleted successfully',
      contextType: 'Delete',
      key: '353'
    },
    addedToCart: {
      context: 'Order',
      desc: 'Added to cart successfully',
      contextType: 'Cart',
      key: '354'
    },
    orderPlaced: {
      context: 'Order',
      desc: 'Order placed successfully',
      contextType: 'Order',
      key: '355'
    },
    orderCancelled: {
      context: 'Order',
      desc: 'Order cancelled successfully',
      contextType: 'Cancel',
      key: '356'
    },
    orderReturnRequest: {
      context: 'Order',
      desc: 'Order return requested successfully',
      contextType: 'ReturnRequest',
      key: '357'
    },
    orderRefund: {
      context: 'Order',
      desc: 'Order amount refunded successfully',
      contextType: 'Refund',
      key: '358'
    },
    
    paymentSuccess: {
      context: 'Order',
      desc: 'payment done successfully',
      contextType: 'Payment',
      key: '356'
    },
    settingCreate: {
      context: 'Settings',
      desc: 'Setting created successfully',
      contextType: 'Create',
      key: '401'
    },
    settingUpdate: {
      context: 'Settings',
      desc: 'Setting updated successfully',
      contextType: 'Update',
      key: '402'
    },
    settingDelete: {
      context: 'Settings',
      desc: 'Setting deleted successfully',
      contextType: 'Delete',
      key: '403'
    },
    brandCreate: {
      context: 'Brand',
      desc: 'Brand created successfully',
      contextType: 'Create',
      key: '451'
    },
    brandUpdate: {
      context: 'Brand',
      desc: 'Brand updated successfully',
      contextType: 'Update',
      key: '452'
    },
    brandDelete: {
      context: 'Brand',
      desc: 'Brand deleted successfully',
      contextType: 'Delete',
      key: '453'
    },
    statementCreate: {
      context: 'Statement',
      desc: 'Statement created successfully',
      contextType: 'Create',
      key: '501'
    },
    statementUpdate: {
      context: 'Statement',
      desc: 'Statement updated successfully',
      contextType: 'Update',
      key: '502'
    },
    statementDelete: {
      context: 'Statement',
      desc: 'Statement deleted successfully',
      contextType: 'Delete',
      key: '503'
    },
    reviewCreate: {
      context: 'Review',
      desc: 'Review created successfully',
      contextType: 'Create',
      key: '601'
    },
    reviewUpdate: {
      context: 'Review',
      desc: 'Review updated Scucessfully',
      contextType: 'Update',
      key: '602'
    },
    reviewDelete: {
      context: 'Review',
      desc: 'Review deleted Sucessfully',
      contextType: 'Delete',
      key: '603'
    },
    favoriteCreate: {
      context: 'Favorite',
      desc: 'Favorite created successfully',
      contextType: 'Create',
      key: '651'
    },
    favoriteUpdate: {
      context: 'Favorite',
      desc: 'Favorite updated Scucessfully',
      contextType: 'Update',
      key: '652'
    },
    favoriteDelete: {
      context: 'Favorite',
      desc: 'Favorite deleted Sucessfully',
      contextType: 'Delete',
      key: '653'
    },
    dealCreate: {
      context: 'Deal',
      desc: 'Deal created successfully',
      contextType: 'Create',
      key: '701'
    },
    dealUpdate: {
      context: 'Deal',
      desc: 'Deal updated Scucessfully',
      contextType: 'Update',
      key: '702'
    },
    dealDelete: {
      context: 'Deal',
      desc: 'Deal deleted Sucessfully',
      contextType: 'Delete',
      key: '703'
    },
    attributeCreate: {
      context: 'Attribute',
      desc: 'Attribute created successfully',
      contextType: 'Create',
      key: '751'
    },
    attributeUpdate: {
      context: 'Attribute',
      desc: 'Attribute updated Scucessfully',
      contextType: 'Update',
      key: '752'
    },
    attributeDelete: {
      context: 'Attribute',
      desc: 'Attribut deleted Sucessfully',
      contextType: 'Delete',
      key: '753'
    },
    announcementCreate: {
      context: 'Announcement',
      desc: 'Announcement created successfully',
      contextType: 'Create',
      key: '801'
    },
    announcementUpdate: {
      context: 'Announcement',
      desc: 'Announcement updated Scucessfully',
      contextType: 'Update',
      key: '802'
    },
    announcementDelete: {
      context: 'Announcement',
      desc: 'Announcement deleted Sucessfully',
      contextType: 'Delete',
      key: '803'
    },
    ticketCreate: {
      context: 'Ticket',
      desc: 'Ticket created successfully',
      contextType: 'Create',
      key: '851'
    },
    ticketUpdate: {
      context: 'Ticket',
      desc: 'Ticket updated Scucessfully',
      contextType: 'Update',
      key: '852'
    },
    ticketDelete: {
      context: 'Ticket',
      desc: 'Ticket deleted Sucessfully',
      contextType: 'Delete',
      key: '853'
    },
    buyerCreate: {
      context: 'Customer',
      desc: 'Customer created successfully',
      contextType: 'Create',
      key: '901'
    },
    buyerUpdate: {
      context: 'Customer',
      desc: 'Customer updated successfully',
      contextType: 'Update',
      key: '902'
    },
    buyerDelete: {
      context: 'Customer',
      desc: 'Customer deleted Sucessfully',
      contextType: 'Delete',
      key: '903'
    },
    buyerLoginSuccess: {
      context: 'Customer',
      desc: 'Login Successfully',
      contextType: 'Login',
      key: '904'
    },
    buyerLoginFailure: {
      context: 'Customer',
      desc: 'Credentials not matched',
      contextType: 'LoginFail',
      key: '905'
    },
    buyerLogout: {
      context: 'Customer',
      desc: 'Customer logout successfully',
      contextType: 'Logout',
      key: '906'
    },
    buyerChangePassword: {
      context: 'Customer',
      desc: 'Customer password changed successfully',
      contextType: 'ChangePassword',
      key: '907'
    },
    buyerForgotPassword: {
      context: 'Customer',
      desc: 'Customer forgot password send email successfully',
      contextType: 'ForgotPassword',
      key: '908'
    },
    buyerLoginOTP: {
      context: 'Customer',
      desc: 'Login code sent successfully',
      contextType: 'Customer',
      key: '909'
    },
    buyerVerifyOTP: {
      context: 'Customer',
      desc: 'Login matched successfully',
      contextType: 'Customer',
      key: '910'
    },
    sellerCreate: {
      context: 'Merchant',
      desc: 'Merchant created successfully',
      contextType: 'Create',
      key: '951'
    },
    sellerUpdate: {
      context: 'Merchant',
      desc: 'Merchant updated successfully',
      contextType: 'Update',
      key: '952'
    },
    sellerDelete: {
      context: 'Merchant',
      desc: 'Merchant deleted Sucessfully',
      contextType: 'Delete',
      key: '953'
    },
    sellerLoginSuccess: {
      context: 'Merchant',
      desc: 'Login Successfully',
      contextType: 'Login',
      key: '954'
    },
    sellerLoginFailure: {
      context: 'Merchant',
      desc: 'Credentials not matched',
      contextType: 'LoginFail',
      key: '955'
    },
    sellerLogout: {
      context: 'Merchant',
      desc: 'Merchant logout successfully',
      contextType: 'Logout',
      key: '956'
    },
    sellerChangePassword: {
      context: 'Merchant',
      desc: 'Merchant password changed successfully',
      contextType: 'ChangePassword',
      key: '957'
    },
    sellerForgotPassword: {
      context: 'Merchant',
      desc: 'Merchant forgot password send email successfully',
      contextType: 'ForgotPassword',
      key: '958'
    },
    sellerLoginOTP: {
      context: 'Merchant',
      desc: 'Login code sent successfully',
      contextType: 'Merchant',
      key: '959'
    },
    sellerVerifyOTP: {
      context: 'Merchant',
      desc: 'Login matched successfully',
      contextType: 'Merchant',
      key: '960'
    },
    subscriptionCreate: {
      context: 'Subscription',
      desc: 'Subscription created successfully',
      contextType: 'Create',
      key: '1001'
    },
    subscriptionUpdate: {
      context: 'Subscription',
      desc: 'Subscription updated Scucessfully',
      contextType: 'Update',
      key: '1002'
    },
    subscriptionDelete: {
      context: 'Subscription',
      desc: 'Subscription deleted Sucessfully',
      contextType: 'Delete',
      key: '1003'
    },
    planCreate: {
      context: 'Plan',
      desc: 'Plan created successfully',
      contextType: 'Create',
      key: '1051'
    },
    planUpdate: {
      context: 'Plan',
      desc: 'Plan updated Scucessfully',
      contextType: 'Update',
      key: '1052'
    },
    planDelete: {
      context: 'Plan',
      desc: 'Plan deleted Sucessfully',
      contextType: 'Delete',
      key: '1053'
    },
    newsLetterCreate: {
      context: 'NewsLetter',
      desc: 'NewsLetter created successfully',
      contextType: 'Create',
      key: '1101'
    },
    newsLetterUpdate: {
      context: 'NewsLetter',
      desc: 'NewsLetter updated Successfully',
      contextType: 'Update',
      key: '1102'
    },
    newsLetterDelete: {
      context: 'NewsLetter',
      desc: 'NewsLetter deleted Successfully',
      contextType: 'Delete',
      key: '1103'
    },
    exchangeratesCreate: {
      value: 'EXCHANGERATE_CREATE',
      desc: 'exchangerates created Successfully',
      contextType: 'Cretae',
      key: '1150'
    },
    exchangeratesUpdate: {
      value: 'EXCHANGERATE_UPDATE',
      desc: 'exchangerates updated Successfully',
      contextType: 'update',
      key: '1151'
    },
    exchangeratesDelete: {
      value: 'EXCHANGERATE_DELETE',
      desc: 'exchangerates deleted Successfully',
      contextType: 'delete',
      key: '1152'
    },
    categoryRequestCreate: {
      context: 'CategoryRequest',
      desc: 'Category request created successfully',
      contextType: 'Create',
      key: '1201'
    },
    categoryRequestUpdate: {
      context: 'CategoryRequest',
      desc: 'Category request updated successfully',
      contextType: 'Update',
      key: '1202'
    },
    categoryRequestDelete: {
      context: 'CategoryRequest',
      desc: 'Category request deleted successfully',
      contextType: 'Delete',
      key: '1203'
    },
    paymentCreate: {
      context: 'Payment',
      desc: 'Payment created successfully',
      contextType: 'Create',
      key: '1251'
    },
    paymentUpdate: {
      context: 'Payment',
      desc: 'Payment updated successfully',
      contextType: 'Update',
      key: '1252'
    },
    paymentDelete: {
      context: 'Payment',
      desc: 'Payment deleted successfully',
      contextType: 'Delete',
      key: '1253'
    },
    colorCreate: {
      context: 'Color',
      desc: 'Color created successfully',
      contextType: 'Create',
      key: '1301'
    },
    colorUpdate: {
      context: 'Color',
      desc: 'Color updated successfully',
      contextType: 'Update',
      key: '1302'
    },
    colorDelete: {
      context: 'Color',
      desc: 'Color deleted successfully',
      contextType: 'Delete',
      key: '1303'
    },
    promocodeCreate: {
      context: 'Couponcode',
      desc: 'Coupon code created successfully',
      contextType: 'Create',
      key: '1351'
    },
    promocodeUpdate: {
      context: 'Couponcode',
      desc: 'Coupon code updated successfully',
      contextType: 'Update',
      key: '1352'
    },
    promocodeDelete: {
      context: 'Couponcode',
      desc: 'Coupon code deleted successfully',
      contextType: 'Delete',
      key: '1353'
    },
    userpromocodeCreate: {
      context: 'UserCouponcode',
      desc: 'UserCouponcode created successfully',
      contextType: 'Create',
      key: '1401'
    },
    userpromocodeUpdate: {
      context: 'UserCouponcode',
      desc: 'UserCouponcode updated successfully',
      contextType: 'Update',
      key: '1402'
    },
    userpromocodeDelete: {
      context: 'userCouponcode',
      desc: 'UserCouponcode deleted successfully',
      contextType: 'Delete',
      key: '1403'
    }
  }
};

export default config;
