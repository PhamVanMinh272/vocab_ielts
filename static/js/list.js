let list = (function() {
  // list of lists
  let listCardsContainerSelector = $(".lists-cards-container")
  // list management dialog
  let listManagementDialogSelector = $("#manage-list-dialog")
  let listContentSelector = $(".list-content")
  let currentListSelector = $(".header-content-of-a-list")
  let tableListDetailSelector = $(".list-content-table")

  let getCurrentListSelector = function() {
    return currentListSelector
  }

  let showListWords = function(listId, listName) {
    $.getJSON(`/lists/${listId}/words`)
    .done(function(result){
      listContentSelector.show();
      currentListSelector.children("h2").text(listName);
      currentListSelector.attr("list-id", listId);
      currentListSelector.attr("list-name", listName);
      $(".management-list-btn-container").removeClass("disabled");
      tableListDetailSelector.html(`
        <tr>
          <th>No</th>
          <th>Vietnamese</th>
          <th>English</th>
          <th>Delete</th>
          <th>Edit</th>
        </tr>
      `);
      let rows = "";
      $.each(result.viets, function(index, word) {
        var tdEng = [];
        $.each(word.eng_words, function(index, eng) {
          tdEng.push(eng.word);
        });
        
        rows += (`
          <tr class="words-table-item" viet-id="${word.word_id}" viet-word="${word.word}">
            <td>${index+1}</td>
            <td>${word.word}</td>
            <td>${tdEng.join(", ")}</td>
            <td><a viet-id="${word.word_id}" viet-word="${word.word}" class="delete-word-btn"><img class="img-word-actions" src="/static/public/trash.png"></a></td>
            <td><a viet-id="${word.word_id}" viet-word="${word.word}" class="edit-word-btn"><img class="img-word-actions" src="/static/public/edit.png"></a></td>
          </tr>
        `);
      });
      tableListDetailSelector.append(rows)
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("Cannot get the words", ERROR_MESSAGE_TYPE);
      }
    });
  }

  let closeManagementDialog = function() {
    listManagementDialogSelector.hide()
  }

  let callDeleteListApi = function(listId) {
    $.ajax({
      url: `/lists/${listId}`,
      type: 'DELETE',
      success: function(result) {
        if (result.message) {
          toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE);
        } else {
          toastMessage.showMessage("The list deleted", SUCCESS_MESSAGE_TYPE);
        }
        closeManagementDialog()
      },
      error: function(error) {
        if (error.responseJSON) {
          toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
        } else {
          toastMessage.showMessage("Delete list failed", ERROR_MESSAGE_TYPE);
        }
      }
    });
    deleteConfirmation.closeDeleteConfirmation()
  }

  let deleteList = function(listId, listName) {
    deleteConfirmation.showDeleteConfirmation(listId, listName, callDeleteListApi)
  }

  let callSearchApi = function(listName) {
    $.getJSON("/search/lists", { list_name: listName })
    .done(function(result) {
      listCardsContainerSelector.html('');
      if (result.lists.length === 0) {
        toastMessage.showMessage("No data", SUCCESS_MESSAGE_TYPE);
        return false;
      }
      $.each(result.lists, function(id, list) {
        listCardsContainerSelector.append(
          `<div class="card-of-list">
              <div class="card-content">
                  <div class="name-of-list text-overflow-dot">${list.list_name}</div>
                  <div class="property-of-list">
                      <div>
                          Vietnamese: ${list.num_viets} words
                      </div>
                      <div>
                          English: ${list.num_engs} words
                      </div>
                  </div>
              </div>
              <div class="card-footer">
                  <a class="quiz-list-btn" href="/lesson">Quiz</a>
              </div>
          </div>`
        );
      });
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("Cannot search lists", ERROR_MESSAGE_TYPE);
      }
    });
  }

  return {
    showListWords: showListWords,
    deleteList: deleteList,
    callSearchApi: callSearchApi,
    getCurrentListSelector: getCurrentListSelector
  }

})();