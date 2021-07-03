// The module pattern
let user = (function() {
  // Private variables of register
  let registerUsernameSelector = $("input#register-username")
  let registerPasswordSelector = $("input#register-password")
  let registerConfirmPasswordSelector = $("input#register-confirm-password")
  let registerMessage = $("#message-register-dialog")
  // Private variables of login
  let loginUsernameSelector = $("input#login-username")
  let loginPasswordSelector = $("input#login-password")
  let loginMessage = $("#message-login-dialog")

  let checkRegisterInfo = function() {
    let username = registerUsernameSelector.val();
    let password = registerPasswordSelector.val();
    let confirmPassword = registerConfirmPasswordSelector.val();
    if (!username || !password || !confirmPassword) {
      registerMessage.text("Please fill out all fields");
      return false;
    } else if (username.indexOf(" ") !== -1 || password.indexOf(" ") !== -1 || confirmPassword.indexOf(" ") !== -1) {
      registerMessage.text("Space characters do not allow");
      return false;
    } else if (password !== confirmPassword) {
      registerMessage.text("The confirm-password does not match the password");
      return false;
    }
    return true
  }

  let callApiRegister = function() {
    if (!checkRegisterInfo()) {
      return false
    }
    $.post("/register", { 
      "username": registerUsernameSelector.val(),
      "password": registerPasswordSelector.val(),
      "confirm_password": registerConfirmPasswordSelector.val()
    })
    .done(function(result) {
      $(".modal").hide();
      toastMessage.showMessage(result.message, successCategory);
    })
    .fail(function(error) {
      if (error.responseJSON) {
        registerMessage.text(error.responseJSON.erMsg);
      } else {
        registerMessage.text("Failed to create an account");
      }
    });
  }

  let checkLogininfo = function() {
    let username = loginUsernameSelector.val()
    let password = loginPasswordSelector.val()
    if (!username || !password) {
      loginMessage.text("Please fill out all fields.")
      return false
    }
    return true
  }

  let callApiLogout = function() {
    $.post("/logout")
    .done(function() {
      location.reload();
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg);
      } else {
        toastMessage.showMessage("Failed to logout");
      }
    });
  }

  // Public API
  return {
    callApiRegister: callApiRegister,
    checkLogininfo: checkLogininfo,
    callApiLogout: callApiLogout
  };
})();
 