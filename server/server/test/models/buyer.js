import fake from '../lib/fake';

function Buyer(options = {}) {
  var firstName = options.firstName || fake.name();
  var lastName = options.lastName || fake.postfix();
  var email = options.email || fake.email();
  var password = options.password ;
  var phoneNumber = options.phoneNumber || fake.phone({ formatted: false });
  var entityType = options.entityType || "buyer";
  var accessToken = options.accessToken || "";

  this.getFirstName = function getFirstName() {
    return firstName;
  };

  this.getLastName = function getLastName() {
    return lastName;
  };

  this.getEmail = function getEmail() {
    return email;
  };

  this.getEntityType = function getEntityType() {
    return entityType;
  };
  this.getPassword = function getPassword() {
    return password;
  };

  this.getPhoneNumber = function getPhoneNumber() {
    return phoneNumber;
  };

  this.getAccessToken = function getAccessToken() {
    return accessToken;
  };

  this.setAccessToken = function setAccessToken(newAccessToken) {
    accessToken = newAccessToken;
  };
}

export default Buyer;
