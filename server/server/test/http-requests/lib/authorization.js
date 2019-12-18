'use strict';
import request from 'supertest-as-promised';
import app from './../../../index';
import httpUtils  from  "./httpUtils";
import requestOptions from  "./options";
import requestSender  from  "./requestSender";
const loggedInUsers  = [];

function Authorization() {

  function getNewToken(targetUser) {
    const loginOptions = requestOptions.getLogin(targetUser);

    return requestSender.sendRequest(loginOptions, "getting login")
        .then((response) => response.accessToken)
        .catch((err) => httpUtils.throwError("Unable to get new access token", targetUser, err));
  }

  function cacheUser(user, token) {
    if(!loggedInUsers.find((logUser) => logUser.email === user.email)) {
      loggedInUsers.push({email: user.email, token: token});
    }
  }

  return{
    getAccess(targetUser) {

      function checkUserIsLogged(user) {
          return Promise.resolve(loggedInUsers.find((logUser) => logUser.email === user.email));
      }

      return checkUserIsLogged(targetUser)
          .then((loggedUser) => loggedUser ? loggedUser.token : getNewToken(targetUser))
          .then((token) => {
              cacheUser(targetUser, token);
              return token;
          })
          .catch((err) => httpUtils.throwError("Error trying to get access", targetUser, err));
    },
    
    getAccessToken(entity) {
      const loginOptions = requestOptions.getLogin(entity);
      return new Promise((resolve, reject) => {
        request(app)
          .post('/api/auth/login')
          .send(loginOptions.json)
          .then((res) => {
            entity.setAccessToken(res.body.accessToken)
            resolve(res.body.accessToken);
          })
          .catch((err) => httpUtils.throwError("Error trying to get access", targetUser, err));
      });
    }
  }
}

export default new Authorization();
