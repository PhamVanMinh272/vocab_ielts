let deleteConfirmation = (function() {
  let deleteConfirmationSelector = $("#confirm-delete-dialog")
  let contentConfirmationSelector = $("#item-delete")
  let sureDeleteBtn = $("#sure-delete")

  let showDeleteConfirmation = function(objectId, objectName, handler, successHandler, failureHandler) {
    contentConfirmationSelector.html(`Are you sure to delete <strong>${objectName}</strong>?`);
    contentConfirmationSelector.attr("object-id", objectId);
    sureDeleteBtn.off("click") // make sure it just have one click handler
    sureDeleteBtn.click(function() {
      handler(objectId, successHandler, failureHandler)
      closeDeleteConfirmation()
    });
    deleteConfirmationSelector.show();
  }

  let closeDeleteConfirmation = function() {
    deleteConfirmationSelector.hide()
    sureDeleteBtn.off("click")
  }

  return {
    showDeleteConfirmation: showDeleteConfirmation,
    closeDeleteConfirmation: closeDeleteConfirmation
  }
})();