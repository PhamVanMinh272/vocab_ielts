let word = (function() {
  let moreFieldBtnSelector = $(".more-eng-field")

  let callGetWordApi = function(vietId) {
    $.getJSON(`/words/${vietId}`)
    .done(function(result) {
      clearDetailViet();
      $("#add-update-btn-container").html(
        `
          <button id="cancel-update-words-btn">Cancel</button>
          <button id="update-words-btn save-btn-style" viet-id="${vietId}">Update</button>
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
        toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
      } else {
        toastMessage.showMessage("Cannot get the Vietnamese word", errorCategory);
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
          toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
        } else {
          toastMessage.showMessage("Delete word failed", errorCategory);
        }
      }
    });
  }

  let callGetLessonApi = function(listId, numOfWords) {
    $.getJSON(`/lists/${listId}/words`, {number_of_words: numOfWords, lesson: 1})
    .done(function(result){
      if (result.viets.length == 0) {
        toastMessage.showMessage("No words to learn", errorCategory);
      } else {
        var start_with = 1;
        localStorage.setItem("no", start_with);
        $.each(result.viets, function(i, data){
          localStorage.setItem(data.no, JSON.stringify(data));
        });
        localStorage.setItem("length_viet_words", result.viets.length);
        // enable study area and set status for previous and next btn
        $(".lesson-area").removeClass("disabled");
        managePreviousNextBtn(start_with);
        // set the first word
        data = JSON.parse(localStorage.getItem(start_with));
        $(".viet-word").html(data.word);
        $(".viet-word").attr('id', data.id);
        // number of user answer input
        localStorage.setItem("num_user_answer_input", 1);
      };
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
      } else {
        toastMessage.showMessage("Cannot start the lesson", errorCategory);
      }
    });
  }
  
  let callCheckVocabApi = function(data) {
    $.getJSON(`/words/${$(".viet-word").attr('id')}/check-vocab`, { eng_words: JSON.stringify(data) })
    .done(function(result){
      $.each(result.eng_words, function(i, field){
        if (field.status === 1) {
          $("input#"+field.id_input).css("background-color", "#52c41a");
        } else {
          $("input#"+field.id_input).css("background-color", "#ec6d74");
        }
      });
      $(".answers").html("");
      $.each(result.eng_data, function(i, field){
        $(".answers").append("<div class='answer'>" + field + "</div>");
      });
    })
    .fail(function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, errorCategory);
      } else {
        toastMessage.showMessage("Cannot check the answers.", errorCategory);
      }
    });
  }

  return {
    callUpdateApi: callUpdateApi,
    callCreateApi: callCreateApi,
    callGetWordApi: callGetWordApi,
    callDeleteWordApi: callDeleteWordApi,
    callGetLessonApi: callGetLessonApi,
    callCheckVocabApi: callCheckVocabApi
  }
})();