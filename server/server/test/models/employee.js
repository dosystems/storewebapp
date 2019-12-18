import fake from '../lib/fake';

function Employee(options = {}) {
  var firstName  = options.firstName  || fake.name();
  var lastName   = options.lastName   || fake.postfix();
  var email      = options.email      || fake.email();
  var phone      = options.phone      || fake.phone({ formatted: false });;
  var password   = options.password   || "Admin1234$";
  var entityType = options.entityType || "employee";
  var accessToken= options.accessToken || "";
  
  this.getFirstName = function getFirstName() {
    return firstName;
  };
  
  this.getLastName = function getLastName() {
    return lastName;
  };
  
  this.getEmail = function getEmail() {
    return email;
  };
  
  this.getPassword = function getPassword() {
    return password;
  };
  
  this.getPhone = function getPhone() {
    return phone;
  };
  
  this.getEntityType = function getEntityType() {
    return entityType;
  };
  
  this.getAccessToken = function getAccessToken() {
    return accessToken;
  };
  
  this.setAccessToken = function setAccessToken(newAccessToken) {
    accessToken = newAccessToken;
  };
  
}
export default Employee;
