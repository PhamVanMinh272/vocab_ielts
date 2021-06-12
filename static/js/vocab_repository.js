$("#add-words-form").submit(function() {
  rmInputRedundantSpaces("#viet");
  rmInputRedundantSpaces("#engs");
  return true
});

$("#list-creation-form").submit(function() {
  rmInputRedundantSpaces("#list_name");
});

$("#list-of-word-lists").keyup(function() {
  var listName = rmRedundantSpaces($(this).val());
  if (!listName) {
    $(".create-a-list-btn").addClass("disabled");
    $(".add-word-area").addClass("disabled");
    return false;
  }
  var validation_list_name = $("#list-of-lists").find("option[value='" + listName + "']");
  if (validation_list_name && validation_list_name.length > 0) {
    $(".create-a-list-btn").addClass("disabled");
    $(".add-word-area").removeClass("disabled");
  } else {
    $(".create-a-list-btn").removeClass("disabled");
    $(".add-word-area").addClass("disabled");
  }
});

$(".create-a-list-btn").click(function() {
  rmInputRedundantSpaces("#list-of-word-lists");
  $.post("/create-list", { list_name: $("#list-of-word-lists").val() })
  .done(function(result){
    $("#list-of-lists").append(`<option value="${result.list_name}">`)
    showMessage(`The list ${result.list_name} was saved successfully.`, 'success');
    $(".create-a-list-btn").addClass("disabled");
    $(".add-word-area").removeClass("disabled");
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot create the list.", 'error');
    }
  });
});


