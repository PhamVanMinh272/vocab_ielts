let toastMessage = (function() {
  let showMessageTime = 3000;
  let messageContainerSelector = $('.messages-container')

  let showMessage = function(message, category) {
    let messageId = Date.now()
    let messageElement = $("<div></div>").addClass("message-dialog show-message")
    messageElement.attr("id", messageId)
    let messageIconElement = $("<img>").addClass("icon-message")
    messageIconElement.attr("src", `/static/public/${category}.png`)
    messageElement.append(messageIconElement)
    messageElement.append("&nbsp;")
    messageElement.append(message)
    messageContainerSelector.append(messageElement)
    setTimeout(function(){
      $(`#${messageId}`).remove()
    }, showMessageTime);
  }

  let setTimeoutFlashMessage = function() {
    let messageId = Date.now();
    $(".message-dialog").attr("id", messageId);
    // Delay the action
    setTimeout(function(){
      $(`#${messageId}`).remove();
    }, showMessageTime);
  }

  function clearMessages() {
    messageContainerSelector.html("");
  }

  return {
    showMessage: showMessage,
    clearMessages: clearMessages,
    setTimeoutFlashMessage: setTimeoutFlashMessage
  }
})();

