
function SellerPayload() {
  return {
    getLoginSeller(seller) {
      return  {
        email: seller.getEmail(),
        password: seller.getPassword(),
        entityType: seller.getEntityType()
      }
    },

    getPostSeller(seller) {
      return {
        firstName: seller.getFirstName(),
        lastName: seller.getLastName(),
        email: seller.getEmail(),
        comapnyName: seller.getCompanyName(),
        phoneNumber: seller.getPhoneNumber()
      }
    }
  }
}


export default SellerPayload;
