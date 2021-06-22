var errorCategory = "error";
var successCategory = "success";

function rmInputRedundantSpaces(selector) {
  $(selector).val($(selector).val().replace(/\s+/g, ' ').trim());
}

function rmRedundantSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function showMessage(message, category) {
  var html = `<div class="${category}-message message"> \
                ${message} \
                <span class="closebtn" onclick='this.parentElement.style.display="none";'>&times;</span> \
              </div> `
  $('.messages-container').html(html);
}

function clearMessages() {
    $('.messages-container').html("");
}

$("#register-btn").click(function() {
  let username = $("input#register-username").val();
  let password = $("input#register-password").val();
  let confirmPassword = $("input#register-confirm-password").val();
  if (!username || !password || !confirmPassword) {
    $("#message-register-dialog").html("Please fill out all fields.");
    return false;
  } else if (username.indexOf(" ") !== -1 || password.indexOf(" ") !== -1 || confirmPassword.indexOf(" ") !== -1) {
    $("#message-register-dialog").html("Space characters do not allow.");
    return false;
  } else if (password !== confirmPassword) {
    $("#message-register-dialog").html("The confirm-password does not match the password.");
    return false;
  }
  $.post("/register", { 
    "username": $("#register-username").val(),
    "password": $("#register-password").val(),
    "confirm_password": $("#register-confirm-password").val()
  })
  .done(function() {
    $(".modal").css("display", "none");
    showMessage("Create an account successfully.", "success");
  })
  .fail(function(error) {
    if (error.responseJSON) {
      $("#message-register-dialog").html(error.responseJSON.erMsg);
    } else {
      $("#message-register-dialog").html("Failed to create an account.");
    }
  });
});

$("#login-btn").submit(function() {
  let username = $("input#login-username").val();
  let password = $("input#login-password").val();
  if (!username || !password) {
    $("#message-register-dialog").html("Please fill out all fields.");
    return false;
  }
});

$(".user-action").on("click", "#logout-btn", function() {
  $.post("/logout")
  .done(function() {
    location.reload();
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg);
    } else {
      showMessage("Failed to logout.");
    }
  });
});
