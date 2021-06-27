$(".register-action").click(function(e) {
  // use stopPropagation to prevent stopping modal when click body
  e.stopPropagation();
  closeDialog();
  $("#register-dialog").css("display", "block");
});

$(".login-action").click(function(e) {
  // use stopPropagation to prevent stopping modal when click body
  e.stopPropagation();
  closeDialog();
  $("#login-dialog").css("display", "block")
});

$("body").mousedown(function() {
  closeDialog();
});

// Prevent stopping modal when mousedown body
$(".modal-content, .register-action, .login-action").mousedown(function(e){
  e.stopPropagation();
});

function closeDialog() {
  $(".message-in-dialog").html("");
  $(".modal").css("display", "none");
  $(".modal input").val("");
}
