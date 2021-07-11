var ERROR_MESSAGE_TYPE = "error"
var SUCCESS_MESSAGE_TYPE = "success"
var MESSAGE_TIMEOUT = 3000
var DEFAULT_LESSON_WORDS_QUANTITY = 20

function rmInputRedundantSpaces(selector) {
  $(selector).val($(selector).val().replace(/\s+/g, ' ').trim())
}

function rmRedundantSpaces(value) {
  return value.replace(/\s+/g, ' ').trim()
}

const HTTP_POST = 'POST'
const HTTP_GET = 'GET'
const HTTP_PUT = 'PUT'
const HTTP_DELETE = 'DELETE'


let callAPI = function(url, httpMethod, data, successHandler, failureHandler) {
  $.ajax({
    url: url,
    type: httpMethod,
    data: JSON.stringify(data),
    contentType: 'application/json',
    processData: false,
    success: function(result) {
      successHandler(result)
    },
    error: function(error) {
      failureHandler(error)
    }
  })
}

$(function() {
  toastMessage.setTimeoutFlashMessage()
  let userComponent = (function() {
    // Include register, login
    let registerActionBtn = $(".register-action")
    let registerDialog = $("#register-dialog")
    let registerUsername = $("input#register-username")
    let registerPassword = $("input#register-password")
    let registerConfirmPassword = $("input#register-confirm-password")
    let registerMessage = $("#message-register-dialog")
    let registerBtn = $("#register-btn")
  
    let loginActionBtn = $(".login-action")
    let loginDialog = $("#login-dialog")
    let loginUsername = $("input#login-username")
    let loginPassword = $("input#login-password")
    let loginMessage = $("#message-login-dialog")
    let loginForm = $("#login-form")
    let loginBtn = $("#login-btn")
  
    let accountDropBtn = $(".account-dropbtn")
    let accountDropdown = $("#account-dropdown")
    let body = $("body")
  
    let allDialogs = $(".modal")
    let messagesInAllDialogs = $(".message-in-dialog")
    let inputsInAllDialogs = $(".modal input")
  
    // set handlers for user's actions area in menu
    registerActionBtn.click(function(e) {
      // use stopPropagation to prevent stopping modal when click body
      e.stopPropagation();
      closeDialogs();
      registerDialog.show();
    })
  
    loginActionBtn.click(function(e) {
      // use stopPropagation to prevent stopping modal when click body
      e.stopPropagation();
      closeDialogs();
      loginDialog.show()
    })
  
    accountDropBtn.click(function(e) {
      e.stopPropagation();
      accountDropdown.hide()
      accountDropdown.slideToggle()
    })
  
    // close dropdown btn
    body.click(function() {
      accountDropdown.hide()
    })
  
    let closeDialogs = function() {
      // register and login
      messagesInAllDialogs.html("");
      allDialogs.hide();
      inputsInAllDialogs.val("");
      // confirm delete
      $("#sure-delete").off("click");
      // list detail
      $("input#viet-word").val('');
      $("input.eng-word").val('');
      $(".more-eng-field").html('');
    }
  
    // register dialog
    let checkRegisterInfo = function() {
      let username = registerUsername.val()
      let password = registerPassword.val()
      let confirmPassword = registerConfirmPassword.val()
      if (!username || !password || !confirmPassword) {
        registerMessage.text("Please fill out all fields")
        return false;
      } else if (username.indexOf(" ") !== -1 || password.indexOf(" ") !== -1 || confirmPassword.indexOf(" ") !== -1) {
        registerMessage.text("Space characters do not allow")
        return false
      } else if (password !== confirmPassword) {
        registerMessage.text("The confirm-password does not match the password")
        return false
      }
      return true
    }
  
    let handleRegisterSuccess = function(result) {
      // toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
      location.reload()
    }
  
    let handleRegisterFailure = function(error) {
      if (error.responseJSON) {
        registerMessage.text(error.responseJSON.erMsg)
      } else {
        registerMessage.text("Failed to create an account")
      }
    }
  
    registerBtn.click(function() {
      if (!checkRegisterInfo()) {
        return false
      }
      let data = { 
        "username": registerUsername.val(),
        "password": registerPassword.val(),
        "confirm_password": registerConfirmPassword.val()
      }
      user.callRegisterAPI(data, handleRegisterSuccess, handleRegisterFailure)
    })
  
    // login dialog
    let getLoginInfo = function() {
      let username = loginUsername.val()
      let password = loginPassword.val()
      if (!username || !password) {
        loginMessage.text("Please fill out all fields")
        return false
      }
      return {username, password}
    }

    let handleLoginSuccess = function(result) {
      location.reload()
      // if (result.message) {
      //   toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
      // } else {
      //   toastMessage.showMessage("Login successfully", SUCCESS_MESSAGE_TYPE)
      // }
    }

    let handleLoginFailure = function(error) {
      if (error.responseJSON) {
        loginMessage.text(error.responseJSON.erMsg)
      } else {
        loginMessage.text("Login failed")
      }
    }
  
    loginBtn.click(function() {
      let data = getLoginInfo()
      if (!data) {
        return false
      }
      user.callLoginAPI(data, handleLoginSuccess, handleLoginFailure)
    })
  })()
})
