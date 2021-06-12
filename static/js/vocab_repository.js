$("#add-words-form").submit(function() {
  rmInputRedundantSpaces("#viet");
  rmInputRedundantSpaces("#engs");
  return true
});

$("#list-creation-form").submit(function() {
  rmInputRedundantSpaces("#list_name");
});
