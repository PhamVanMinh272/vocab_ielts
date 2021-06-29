$(".create-a-list-btn").click(function() {
  rmInputRedundantSpaces("#name-of-list-input");
  var listName = $("#name-of-list-input").val();
  if (!listName || listName.length > 50) {
    showMessage("The list's name should within 1 to 50 characters", 'error');
    return false
  }
  $.post("/lists", { list_name: listName })
  .done(function(result){
    showMessage(`The list ${result.list_name} was saved successfully.`, 'success');
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot create the list.", 'error');
    }
  });
});