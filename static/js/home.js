$(function() {
  // list detail dialog
  let listComponent = (function() {
    let searchListByNameBtn = $(".search-btn")
    let searchListByNameInput = $("#list-of-word-lists")

    let listCreationBtn = $(".create-a-list-btn")
    let listCreationInput = $("#name-of-list-input")

    let listMoreActionsDropBtn = $(".list-more-action-dropbtn")
    let listMoreActionsDropdown = $(".list-more-action-dropdown")

    let listDeletionBtn = $(".delete-list-btn")
    let listDetailsBtn = $(".list-details-btn")

    let listCardsContainer = $(".lists-cards-container")
    let noDataContainer = $(".no-data")

    let listManagementDialogSelector = $("#manage-list-dialog")
    let currentList = $(".header-content-of-a-list")
    let tableListDetailSelector = $(".list-content-table")
    let bodyElement = $("body")

    let getCurrentListSelector = function() {
      return currentList
    }

    let getCurrentListInfo = function() {
      return {listId: currentList.attr("list-id"), listName: currentList.attr("list-name")}
    }

    let showListDetail = function(listId, listName) {
      list.callGetWordsAPI(listId, listName)
      listManagementDialogSelector.show()
    }

    // dropdown more actions
    listMoreActionsDropBtn.click(function(e) {
      e.stopPropagation()
      listMoreActionsDropdown.hide()
      $(this).next().slideToggle(200)
    })

    // close dropdown btn
    bodyElement.click(function() {
      listMoreActionsDropdown.hide()
    })

    // search
    let getListSearchInfo = function() {
      rmInputRedundantSpaces("#list-of-word-lists");
      let listName = searchListByNameInput.val()
      if (!listName) {
        return false
      }
      return { list_name: listName }
    }

    let handleListSearchSuccess = function(result) {
      listCardsContainer.html('')
      if (result.lists.length === 0) {
        toastMessage.showMessage("No data", SUCCESS_MESSAGE_TYPE);
        return false
      }
      $.each(result.lists, function(id, list) {
        listCardsContainer.append(
          `<div class="card-of-list" list-id="${list.list_id}" list-name="${list.list_name}">
            <div class="card-content">
                <div id="list-basic-info-container">
                    <div class="name-of-list text-overflow-dot">${list.list_name}</div>
                    <div class="property-of-list">
                        <div>
                            ${list.num_viets} Vietnamese words
                        </div>
                        <div>
                            ${list.num_engs} English words
                        </div>
                    </div>
                </div>
                <div id="parts-of-speech-container">
                    <div class="name-of-list text-overflow-dot">Parts Of Speech</div>
                    <div class="property-of-list">
                        <div>
                            <div>0 Nouns</div>
                            <div>0 Adjectives</div>
                        </div>
                        <div>
                            <div>0 Verbs</div>
                            <div>0 Adverbs</div>
                        </div>
                    </div>
                </div>
                <div id="severity-container">
                    <div class="name-of-list text-overflow-dot">Status</div>
                    <div class="property-of-list">
                        <div>
                            Completed 50%
                        </div>
                    </div>
                </div>
                
            </div>
            <div class="card-footer">
                <a class="quiz-list-btn" href="/lesson/${list.list_id}">Quiz</a>
            </div>
            <div class="dropdown">
                <button class="list-more-action-dropbtn"><img src="/static/public/more.png" ></button>
                <div class="list-more-action-dropdown dropdown-content">
                  <button class="list-details-btn" list-id="${list.list_id}" list-name="${list.list_name}">Details</button>
                  <button class="delete-list-btn" list-id="${list.list_id}" list-name="${list.list_name}">Delete</button>
                </div>
            </div>
        </div>`
        );
      });
    }

    let handleListSearchFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("Cannot search lists", ERROR_MESSAGE_TYPE);
      }
    }

    searchListByNameBtn.click(function() {
      noDataContainer.hide()
      let listData = getListSearchInfo()
      list.callSearchAPI(listData, handleListSearchSuccess, handleListSearchFailure)
    })

    // create list
    let getListCreationInfo = function() {
      rmInputRedundantSpaces("#name-of-list-input");
      let listName = listCreationInput.val()
      if (!listName || listName.length > 50) {
        toastMessage.showMessage("The list's name should within 1 to 50 characters", ERROR_MESSAGE_TYPE)
        return false
      }
      return { list_name: listName }
    }

    let handleCreateListSuccess = function(result) {
      toastMessage.showMessage(`The list ${result.list_name} was saved successfully`, SUCCESS_MESSAGE_TYPE)
      showListDetail(result.list_id, result.list_name)
    }

    let handleCreateListFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot create the list", ERROR_MESSAGE_TYPE)
      }
    }
    
    listCreationBtn.click(function() {
      let data = getListCreationInfo()
      if (!data) {
        return false
      }
      list.callCreateListAPI(data, handleCreateListSuccess, handleCreateListFailure)
    })

    // delete list

    let handleDeleteListSuccess = function(result) {
      if (result.message) {
        toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("The list deleted", SUCCESS_MESSAGE_TYPE);
      }
    }

    let handleDeleteListFailure = function() {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("Delete list failed", ERROR_MESSAGE_TYPE);
      }
    }

    listDeletionBtn.click(function() {
      let listId = $(this).attr("list-id")
      let listName = $(this).attr("list-name")
      deleteConfirmation.showDeleteConfirmation(
        listId,
        listName,
        list.callDeleteListAPI,
        handleDeleteListSuccess,
        handleDeleteListFailure
      )
    });

    // get words

    let handleGetWordsSuccess = function(result) {
      let listId = listDetailsBtn.attr("list-id")
      let listName = listDetailsBtn.attr("list-name")
      listManagementDialogSelector.show()
      currentList.children("h2").text(listName)
      currentList.attr("list-id", listId)
      currentList.attr("list-name", listName)
      tableListDetailSelector.html(`
        <tr>
          <th>No</th>
          <th>Vietnamese</th>
          <th>English</th>
          <th>Delete</th>
          <th>Edit</th>
        </tr>
      `)
      let rows = ""
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
      })
      tableListDetailSelector.append(rows)
    }

    let handleGetWordsFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("Cannot get the words", ERROR_MESSAGE_TYPE);
      }
    }

    listDetailsBtn.click(function() {
      var listId = $(this).attr("list-id")
      list.callGetWordsAPI(listId, handleGetWordsSuccess, handleGetWordsFailure)
    });

    return {
      getCurrentListSelector
    }

  })()

  let wordComponent = (function() {
    let vietnameseInput = $("input#viet-word")
    let defaultEnglishInput = $("#default-eng-word-field")
    let moreEnglishInputContainer = $(".more-eng-field")
    let allEnglishInputs = $('.eng-word')
    let addMoreEnglishInputBtn = $(".add-more-eng-word-field")
    let wordActionBtnContainer = $("#add-update-btn-container")
    let wordCreationBtn = $(".create-words-btn")

    let tableWords = $("#words-table")

    let clearWordDetailsArea = function() {
      vietnameseInput.val('')
      defaultEnglishInput.show()
      allEnglishInputs.val('')
      moreEnglishInputContainer.html('')
    }

    addMoreEnglishInputBtn.click(function() {
      moreEnglishInputContainer.append(`
      <div class="field">
        <input class="eng-word" type="text" name="eng-word" placeholder="English"/><br>
      </div>
      `)
    })

    // get a word
    let handleGetWordSuccess = function(result) {
      clearWordDetailsArea();
      wordActionBtnContainer.html(
        `
          <button id="cancel-update-words-btn" class="cancel-btn-style">Cancel</button>
          <button id="update-words-btn" class="save-btn-style" viet-id="${result.word_id}">Update</button>
        `
      )
      vietnameseInput.val(result.word)
      defaultEnglishInput.hide()
      if (result.eng_words.length>0) {
        $.each(result.eng_words, function(index, eng) {
          moreEnglishInputContainer.append(`
            <div class="field">
              <input class="eng-word" type="text" name="eng-word" engId="${eng.word_id}" value="${eng.word}"/><br>
            </div>
          `);
        });
      }
    }
    let handleGetWordFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot get the Vietnamese word", ERROR_MESSAGE_TYPE)
      }
    }

    tableWords.on("click", ".edit-word-btn", function() {
      let vietId = $(this).attr("viet-id")
      word.callGetWordAPI(vietId, handleGetWordSuccess, handleGetWordFailure)
    });

    // update word
    let getUpdateWordInfo = function() {
      let vietWord = vietnameseInput.val()
      rmInputRedundantSpaces(".viet-word")
      let newEngWords = []
      let engWords = {}
      allEnglishInputs.slice(1).each(function() {
        rmInputRedundantSpaces(this)
        let engWord = this.value
        let engId = $(this).attr("engid")
        if (engId) {
          engWords[engId] = engWord
        } else {
          newEngWords.push(engWord)
        }
      }).get()
      let data = {
        viet_word: vietWord,
        eng_words: JSON.stringify(engWords),
        new_eng_words: JSON.stringify(newEngWords)
      }
      return data
    }

    let handleUpdateWordSuccess = function(result) {
      if (result.message) {
        toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("The words was updated", SUCCESS_MESSAGE_TYPE)
      }
      let listId = listComponent.getCurrentListSelector().attr("list-id")
      let listName = listComponent.getCurrentListSelector().attr("list-name")
      getListWords(listId, listName)
    }

    let handleUpdateWordFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Update words failed", ERROR_MESSAGE_TYPE)
      }
    }

    wordActionBtnContainer.on("click", "#update-words-btn", function() {
      let vietId = $(this).attr("viet-id")
      let data = getUpdateWordInfo()
      word.callUpdateWordAPI(vietId, data, handleUpdateWordSuccess, handleUpdateWordFailure)
    })

    wordActionBtnContainer.on("click", "#cancel-update-words-btn", function() {
      clearWordDetailsArea()
      wordActionBtnContainer.html('<button class="create-words-btn save-btn-style">Save</button>')
    })

    // create word
    let getWordCreationInfo = function() {
      rmInputRedundantSpaces(".viet-word")
      let english_words = allEnglishInputs.map(function() {
        rmInputRedundantSpaces(this)
        return this.value
      }).get()
      let data = { 
        viet: vietnameseInput.val(),
        engs: JSON.stringify(english_words)
      }
      return data
    }

    let handleCreateWordSuccess = function(result) {
      toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
    }

    let handleCreateWordFailure = function() {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot create the words", ERROR_MESSAGE_TYPE)
      }
    }

    wordCreationBtn.click(function() {
      let listId = listComponent.getCurrentListSelector().attr("list-id")
      let data = getWordCreationInfo()
      word.callCreateWordAPI(listId, data, handleCreateWordSuccess, handleCreateWordFailure)
    })

    // delete word
    let handleDeleteWordSuccess = function(result) {
      if (result.message) {
        toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("The list deleted", SUCCESS_MESSAGE_TYPE)
      }
      let listId = listComponent.getCurrentListSelector().attr("list-id")
      let listName = listComponent.getCurrentListSelector().attr("list-name")
      getListWords(listId, listName);
    }

    let handleDeleteWordFailure = function() {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Delete word failed", ERROR_MESSAGE_TYPE)
      }
    }

    tableWords.on("click", ".delete-word-btn", function() {
      let vietId = $(this).attr("viet-id")
      let vietWord = $(this).attr("viet-word")
      deleteConfirmation.showDeleteConfirmation(
        vietId,
        vietWord,
        word.callDeleteWordAPI,
        handleDeleteWordSuccess,
        handleDeleteWordFailure
      )
    })

  })()

})