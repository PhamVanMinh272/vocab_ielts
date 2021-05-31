$("#add-words-form").submit(function() {
  rmInputRedundantSpaces("#viet");
  rmInputRedundantSpaces("#engs");
  return true
});
