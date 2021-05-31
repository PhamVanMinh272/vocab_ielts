function rmInputRedundantSpaces(selector) {
  $(selector).val($(selector).val().replace(/\s+/g, ' ').trim());
}
