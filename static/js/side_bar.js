$(".search-btn").click(function() {
  $(".no-data").hide()
  rmInputRedundantSpaces("#list-of-word-lists");
  let listName = $("#list-of-word-lists").val();
  if (!listName) {
    return false;
  }
  list.callSearchApi(listName)
})

$(".create-a-list-btn").click(function() {
  rmInputRedundantSpaces("#name-of-list-input");
  var listName = $("#name-of-list-input").val();
  if (!listName || listName.length > 50) {
    toastMessage.showMessage("The list's name should within 1 to 50 characters", errorCategory);
    return false
  }
  $.post("/lists", { list_name: listName })
  .done(function(result){
    toastMessage.showMessage(`The list ${result.list_name} was saved successfully.`, 'success');
    showListDetail(result.list_id, result.list_name);
  })
  .fail(function(error) {
    if (error.responseJSON) {
      toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
    } else {
      toastMessage.showMessage("Cannot create the list.", errorCategory);
    }
  });
});