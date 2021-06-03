function rmInputRedundantSpaces(selector) {
  $(selector).val($(selector).val().replace(/\s+/g, ' ').trim());
}

function showMessage(message, category) {
  var html = `<div class="${category}-message message"> \
                ${message} \
                <span class="closebtn" onclick="this.parentElement.style.display="none";">&times;</span> \
              </div> `
  $('.messages-container').html(html);
}

function clearMessages() {
    $('.messages-container').html("");
}
