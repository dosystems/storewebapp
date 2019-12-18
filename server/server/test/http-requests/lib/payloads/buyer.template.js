

function BuyerPayload() {
  return {
    getLoginBuyer(buyer) {
      return  {
        email: buyer.getEmail(),
        password: buyer.getPassword(),
        entityType: buyer.getEntityType()
      }
    },

    getPostBuyer(buyer) {
      return {
        firstName: buyer.getFirstName(),
        lastName: buyer.getLastName(),
        email: buyer.getEmail(),
        phoneNumber: buyer.getPhoneNumber()
      }
    }
  };
}


export default BuyerPayload;
