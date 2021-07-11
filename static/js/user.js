// The module pattern
let user = (function() {
  // Private variables
  let registerEndpoint = "/register"

  let callRegisterAPI = function(data, successHandler, failureHandler) {
    callAPI(registerEndpoint, HTTP_POST, data, successHandler, failureHandler)
  }

  let callLoginAPI = function(data, successHandler, failureHandler) {
    callAPI("/login", HTTP_POST, data, successHandler, failureHandler)
  }

  // Public API
  return {
    callRegisterAPI,
    callLoginAPI
  }
})()
 