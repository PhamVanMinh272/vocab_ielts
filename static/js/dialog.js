$(".register-action").click(function(e) {
  // use stopPropagation to prevent stopping modal when click body
  e.stopPropagation();
  $(".modal").css("display", "none");
  $("#register-dialog").css("display", "block");
});

$(".login-action").click(function(e) {
  // use stopPropagation to prevent stopping modal when click body
  e.stopPropagation();
  $(".modal").css("display", "none");
  $("#login-dialog").css("display", "block")
});

$("body").click(function() {
  $(".modal").css("display", "none");
});

// Prevent stopping modal when click body
$(".modal-content").click(function(e){
  e.stopPropagation();
});


