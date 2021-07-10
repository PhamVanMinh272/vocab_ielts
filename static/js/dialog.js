$("body").mousedown(function() {
  closeDialog();
});

// Prevent stopping modal when mousedown body
$(".modal-content, .register-action, .login-action").mousedown(function(e){
  e.stopPropagation();
});

// cancel delete
$("#cancel-delete").click(function() {
  closeDialog();
});

function closeDialog() {
  // register and login
  $(".message-in-dialog").html("");
  $(".modal").hide();
  $(".modal input").val("");
  // confirm delete
  $("#sure-delete").off("click");
  // list detail
  $("input#viet-word").val('');
  $("input.eng-word").val('');
  $(".more-eng-field").html('');
}

$("#confirm-delete-dialog").mousedown(function(e) {
  e.stopPropagation();
  $(this).hide();
});
