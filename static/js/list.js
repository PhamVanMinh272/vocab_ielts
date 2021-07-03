let list = (function() {
  // list of lists
  let listCardsContainerSelector = $(".lists-cards-container")
  // list management dialog
  let listManagementDialogSelector = $("#manage-list-dialog")
  let listContentSelector = $(".list-content")
  let currentListSelector = $(".header-content-of-a-list")
  let tableListDetailSelector = $(".list-content-table")
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
      let rows = $()
      $.each(result.viets, function(index, word) {
        var tdEng = [];
        $.each(word.eng_words, function(index, eng) {
          tdEng.push(eng.eng_word);
        });
        
        rows.append(`
          <tr class="words-table-item" viet-id="${word.viet_id}" viet-word="${word.viet_word}">
            <td>${index+1}</td>
            <td>${word.viet_word}</td>
            <td>${tdEng.join(", ")}</td>
            <td><a viet-id="${word.viet_id}" viet-word="${word.viet_word}" class="delete-word-btn"><img class="img-word-actions" src="/static/public/trash.png"></a></td>
            <td><a viet-id="${word.viet_id}" viet-word="${word.viet_word}" class="edit-word-btn"><img class="img-word-actions" src="/static/public/edit.png"></a></td>
          </tr>
        `);
      });
      tableListDetailSelector.append(rows)
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, 'error');
      } else {
        toastMessage.showMessage("Cannot get the words", 'error');
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
          toastMessage.showMessage(result.message, successCategory);
        } else {
          toastMessage.showMessage("The list deleted", successCategory);
        }
        closeManagementDialog()
      },
      error: function(error) {
        if (error.responseJSON) {
          toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
        } else {
          toastMessage.showMessage("Delete list failed", errorCategory);
        }
      }
    });
    deleteConfirmation.closeDeleteConfirmation()
  }

  let deleteList = function() {
    let listId = currentListSelector.attr("list-id")
    let listName = currentListSelector.attr("list-name")
    deleteConfirmation.showDeleteConfirmation(listId, listName, callDeleteListApi)
  }

  let callSearchApi = function(listName) {
    $.getJSON("/search/lists", { list_name: listName })
    .done(function(result) {
      listCardsContainerSelector.html('');
      if (result.lists.length === 0) {
        toastMessage.showMessage("No data", successCategory);
        return false;
      }
      $.each(result.lists, function(id, list) {
        listCardsContainerSelector.append(
          `<div class="card-of-list">
              <div class="card-content">
                  <div class="name-of-list text-overflow-dot">${list.list_name}</div>
                  <div class="property-of-list">
                      <div>
                          Vietnamese words: ${list.num_viets} words
                      </div>
                      <div>
                          English words: ${list.num_engs} words
                      </div>
                  </div>
              </div>
              <div class="card-footer">
                  <a class="quiz-list-btn" href="/lesson">Quiz</a>
                  <a class="edit-list-btn" href="/vocab-repository">Edit</a>
              </div>
          </div>`
        );
      });
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
      } else {
        toastMessage.showMessage("Cannot search lists", errorCategory);
      }
    });
  }

  return {
    showListWords: showListWords,
    deleteList: deleteList,
    callSearchApi: callSearchApi
  }

})();