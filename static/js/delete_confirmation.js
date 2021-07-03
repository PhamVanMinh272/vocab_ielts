let deleteConfirmation = (function() {
  let deleteConfirmationSelector = $("#confirm-delete-dialog")
  let contentConfirmationSelector = $("#item-delete")
  let sureDeleteBtn = $("#sure-delete")

  let showDeleteConfirmation = function(objectId, objectName, handler) {
    contentConfirmationSelector.html(`Are you sure to delete <b>${objectName}</b>?`);
    contentConfirmationSelector.attr("object-id", objectId);
    sureDeleteBtn.off("click") // make sure it just have on click handler
    sureDeleteBtn.click(function() {
      handler(objectId);
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