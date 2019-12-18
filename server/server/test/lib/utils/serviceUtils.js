"use strict";
import User from "./../../models/user";
import Employee from "./../../models/employee";
      
function ServiceUtils() {
  return {
    extractUserCredentials(userOptions) {
      console.log(userOptions);

      const userCredentials = {
        email: null,
        password: null
      };

      if(userOptions instanceof User) {
        userCredentials.email = userOptions.getEmailId();
        userCredentials.password = userOptions.getPassword()
      } else if(userOptions instanceof Employee) {
        userCredentials.email = userOptions.getEmail();
        userCredentials.password = userOptions.getPassword()
      } else if (typeof userOptions === 'object') {
        userCredentials.email = userOptions.email;
        userCredentials.password = userOptions.password;
      }

      if(!userCredentials.email || !userCredentials.password) throw new Error(`Invalid user credentials. Email '${userCredentials.email}', Password '${userCredentials.password}'`);

      return userCredentials;
    }
  };
}

export default new ServiceUtils();
