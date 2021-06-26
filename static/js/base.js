var errorCategory = "error";
var successCategory = "success";
var showMessageTime = 3000;

function rmInputRedundantSpaces(selector) {
  $(selector).val($(selector).val().replace(/\s+/g, ' ').trim());
}

function rmRedundantSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function showMessage(message, category) {
  let messageId = Date.now();
  var html = `<div id="${messageId}" class="message-dialog show-message"> \
                <img class="icon-message" src="/static/public/${category}.png">&nbsp; \
                ${message} \
              </div> `
  
  $('.messages-container').append(html);
  setTimeout(function(){
    $(`#${messageId}`).removeClass("show-message");
 }, showMessageTime);
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

$(".account-dropbtn").click(function(e) {
  e.stopPropagation();
  if ($("#account-dropdown").hasClass("show")) {
    $("#account-dropdown").removeClass("show");
  } else {
    $("#account-dropdown").addClass("show");
  }
});

// close dropdown btn
$("body").click(function() {
  $("#account-dropdown").removeClass("show");
});

// Execute something when DOM is ready:
$(document).ready(function(){

  let messageId = Date.now();
  $(".message-dialog").attr("id", messageId);
  // Delay the action
  setTimeout(function(){
     $(`#${messageId}`).removeClass("show-message");
  }, showMessageTime);
});
