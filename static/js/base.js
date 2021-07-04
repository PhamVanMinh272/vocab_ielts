var errorCategory = "error";
var successCategory = "success";
var showMessageTime = 3000;

function rmInputRedundantSpaces(selector) {
  $(selector).val($(selector).val().replace(/\s+/g, ' ').trim());
}

function rmRedundantSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

$("#register-btn").click(function() {
  user.callApiRegister()
});

$("#login-form").submit(function() {
  return user.checkLogininfo()
});

$(".user-action").on("click", "#logout-btn", function() {
  user.callApiLogout()
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
  $("#account-dropdown").hide();
  $(".list-more-action-dropdown").hide();
});

// Execute something when DOM is ready:
$(function(){
  toastMessage.setTimeoutFlashMessage()
});
