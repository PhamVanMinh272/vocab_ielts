let word = (function() {
  let moreFieldBtnSelector = $(".more-eng-field")

  let callGetWordApi = function(vietId) {
    $.getJSON(`/words/${vietId}`)
    .done(function(result) {
      clearDetailViet();
      $("#add-update-btn-container").html(
        `
          <button id="cancel-update-words-btn">Cancel</button>
          <button id="update-words-btn" viet-id="${vietId}">Update</button>
        `
      )
      $("input#viet-word").val(result.word);
      $("#default-eng-word-field").hide();
      if (result.eng_words.length>0) {
        $.each(result.eng_words, function(index, eng) {
          $(".more-eng-field").append(`
            <div class="field">
              <input class="eng-word" type="text" name="eng-word" engId="${eng.word_id}" value="${eng.word}"/><br>
            </div>
          `);
        });
      }
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, 'error');
      } else {
        toastMessage.showMessage("Cannot get the Vietnamese word", 'error');
      }
    });
  }

  let callCreateApi = function(listId, listName, words) {
    $.post(`/lists/${listId}/words`, { 
      viet: $(".viet-word").val(),
      engs: JSON.stringify(words)
    })
    .done(function(result){
      moreFieldBtnSelector.html('');
      toastMessage.showMessage(result.message, successCategory);
      $(".viet-word").val('');
      $(".eng-word").val('');
      getListWords(listId, listName);
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
      } else {
        toastMessage.showMessage("Cannot create the words", errorCategory);
      }
    });
  }

  let callUpdateApi = function(vietId, vietWord, engWords, newEngWords) {
    $.ajax({
      url: `/words/${vietId}`,
      type: 'PUT',
      data: {
        viet_word: vietWord,
        eng_words: JSON.stringify(engWords),
        new_eng_words: JSON.stringify(newEngWords)
      },
      success: function(result) {
        if (result.message) {
          toastMessage.showMessage(result.message, successCategory);
        } else {
          toastMessage.showMessage("The words was updated", successCategory);
        }
        let listId = list.getCurrentListSelector().attr("list-id");
        let listName = list.getCurrentListSelector().attr("list-name");
        getListWords(listId, listName);
      },
      error: function(error) {
        if (error.responseJSON) {
          toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
        } else {
          toastMessage.showMessage("Update words failed", errorCategory);
        }
      }
    });
  }

  let callDeleteWordApi = function(vietId) {
    $.ajax({
      url: `/words/${vietId}`,
      type: 'DELETE',
      success: function(result) {
        if (result.message) {
          toastMessage.showMessage(result.message, 'success');
        } else {
          toastMessage.showMessage("The list deleted", 'success');
        }
        let listId = list.getCurrentListSelector().attr("list-id");
        let listName = list.getCurrentListSelector().attr("list-name");
        getListWords(listId, listName);
      },
      error: function(error) {
        if (error.responseJSON) {
          toastMessage.showMessage(error.responseJSON.erMsg, 'error');
        } else {
          toastMessage.showMessage("Delete word failed", 'error');
        }
      }
    });
  }
  

  return {
    callUpdateApi: callUpdateApi,
    callCreateApi: callCreateApi,
    callGetWordApi: callGetWordApi,
    callDeleteWordApi: callDeleteWordApi
  }
})();