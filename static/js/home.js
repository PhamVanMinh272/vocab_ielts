$(function() {
  // list detail dialog
  let listComponent = (function() {
    let searchListByNameBtn = $(".search-btn")
    let searchListByNameInput = $("#list-of-word-lists")

    let listCreationBtn = $(".create-a-list-btn")
    let listCreationInput = $("#name-of-list-input")

    let listCardsContainer = $(".lists-cards-container")
    let noDataContainer = $(".no-data")

    let listManagementDialogSelector = $("#manage-list-dialog")
    let currentList = $(".header-content-of-a-list")
    let defaultEnglishInput = $("#default-eng-word-field")
    let bodyElement = $("body")

    let getCurrentListSelector = function() {
      return currentList
    }

    let getCurrentListInfo = function() {
      return {listId: currentList.attr("list-id"), listName: currentList.attr("list-name")}
    }

    let showListDetailsDialog = function() {
      listManagementDialogSelector.show()
      defaultEnglishInput.show()
    }

    // dropdown more actions
    listCardsContainer.on("click", ".list-more-action-dropbtn", function(e) {
      e.stopPropagation()
      $(".list-more-action-dropdown").hide()
      $(this).next().slideToggle(200)
    })

    // close dropdown btn
    bodyElement.click(function() {
      $(".list-more-action-dropdown").hide()
    })

    // search
    let getListSearchInfo = function() {
      rmInputRedundantSpaces("#list-of-word-lists")
      let listName = searchListByNameInput.val()
      if (!listName) {
        return false
      }
      return {list_name: listName}
    }

    let handleListSearchSuccess = function(result) {
      listCardsContainer.html('')
      if (result.lists.length === 0) {
        toastMessage.showMessage("No data", SUCCESS_MESSAGE_TYPE)
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
                  <button class="list-details-btn detail-info-btn-style" list-id="${list.list_id}" list-name="${list.list_name}">Details</button>
                  <button class="delete-list-btn delete-btn-style" list-id="${list.list_id}" list-name="${list.list_name}">Delete</button>
                </div>
            </div>
        </div>`
        )
      })
    }

    let handleListSearchFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot get lists", ERROR_MESSAGE_TYPE)
      }
    }

    searchListByNameBtn.click(function() {
      noDataContainer.hide()
      let listData = getListSearchInfo()
      if (!listData) {
        toastMessage.showMessage("The list name is empty", ERROR_MESSAGE_TYPE)
        return false
      }
      list.callSearchAPI(listData, handleListSearchSuccess, handleListSearchFailure)
    })

    // get lists
    let getLists = function() {
      list.callGetListAPI(handleListSearchSuccess, handleListSearchFailure)
    }

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
      showListDetailsDialog()
      currentList.children("h2").text(result.list_name)
      currentList.attr("list-id", result.list_id)
      currentList.attr("list-name", result.list_name)
      wordComponent.getWords(result.list_id)
      getLists()
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
        toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("The list deleted", SUCCESS_MESSAGE_TYPE)
      }
      getLists()
    }

    let handleDeleteListFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Delete list failed", ERROR_MESSAGE_TYPE)
      }
      // need to reload the list after delete a list
    }

    listCardsContainer.on("click", ".delete-list-btn", function() {
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

    // show list dialog

    listCardsContainer.on("click", ".list-details-btn", function() {
      let listId = $(this).attr("list-id")
      let listName = $(this).attr("list-name")
      showListDetailsDialog()
      currentList.children("h2").text(listName)
      currentList.attr("list-id", listId)
      currentList.attr("list-name", listName)
      wordComponent.getWords(listId)
    })

    // default get lists
    getLists()

    return {
      getCurrentListSelector,
      getCurrentListInfo
    }

  })()

  let wordComponent = (function() {
    let vietnameseInput = $("input#viet-word")
    let defaultEnglishInput = $("#default-eng-word-field")
    let moreEnglishInputContainer = $(".more-eng-field")
    let allEnglishInputs = $('.eng-word')
    let addMoreEnglishInputBtn = $(".add-more-eng-word-field")
    let wordActionBtnContainer = $("#add-update-btn-container")

    let noData = $(".list-content-table-container .no-data")
    let tableWords = $("#words-table")
    let tableListDetailSelector = $(".list-content-table")

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

    // get words in a list

    let handleGetWordsSuccess = function(result) {
      if (result.viets.length === 0) {
        noData.show()
        tableListDetailSelector.html("")
        return false
      }
      noData.hide()
      tableListDetailSelector.html(`
      <thead>
        <tr>
          <th>No</th>
          <th>Vietnamese</th>
          <th>English</th>
          <th>Delete</th>
          <th>Edit</th>
        </tr>
      </thead>
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
      tableListDetailSelector.append(`<tbody> ${rows} </tbody>`)
    }

    let handleGetWordsFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE);
      } else {
        toastMessage.showMessage("Cannot get the words", ERROR_MESSAGE_TYPE);
      }
    }

    let getWords = function(listId) {
      list.callGetWordsAPI(listId, handleGetWordsSuccess, handleGetWordsFailure)
    }

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
              <input class="eng-word exist-english-meaning" type="text" placeholder="This meaning will be deleted if it is empty" name="eng-word" engId="${eng.word_id}" value="${eng.word}"/><br>
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
    })

    // create word
    let getWordCreationInfo = function() {
      rmInputRedundantSpaces(".viet-word")
      let vietWord = vietnameseInput.val()
      let englishWords = []
      $(".eng-word").each(function() {
        rmInputRedundantSpaces(this)
        if (this.value) {
          englishWords.push(this.value)
        }
      })
      if (!vietWord) {
        toastMessage.showMessage("Vietnamese word is required", ERROR_MESSAGE_TYPE)
        return false
      }
      if (englishWords.length === 0) {
        toastMessage.showMessage("At least one English word is required", ERROR_MESSAGE_TYPE)
        return false
      }
      let data = { 
        viet: vietnameseInput.val(),
        engs: JSON.stringify(englishWords)
      }
      return data
    }

    let handleCreateWordSuccess = function(result) {
      getWords(listComponent.getCurrentListInfo().listId)
      toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
      clearWordDetailsArea()
    }

    let handleCreateWordFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot create the words", ERROR_MESSAGE_TYPE)
      }
    }

    $(".add-words-container").on("click", ".create-words-btn", function() {
      let listId = listComponent.getCurrentListSelector().attr("list-id")
      let data = getWordCreationInfo()
      if (!data) {
        return false
      }
      word.callCreateWordAPI(listId, data, handleCreateWordSuccess, handleCreateWordFailure)
    })

    // update word
    let getUpdateWordInfo = function() {
      rmInputRedundantSpaces(".viet-word")
      let vietWord = vietnameseInput.val()
      let newEngWords = []
      let engWords = {}
      $('.eng-word').slice(1).each(function() {
        rmInputRedundantSpaces(this)
        let engWord = this.value
        let engId = $(this).attr("engid")
        if (engId) {
          engWords[engId] = engWord
        } else {
          newEngWords.push(engWord)
        }
      })
      if (!vietWord) {
        toastMessage.showMessage("Vietnamese word is required", ERROR_MESSAGE_TYPE)
        return false
      }
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
      getWords(listComponent.getCurrentListInfo().listId)
      clearWordDetailsArea()
      $("#add-update-btn-container #cancel-update-words-btn").trigger("click")
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
      if (!data) {
        return false
      }
      word.callUpdateWordAPI(vietId, data, handleUpdateWordSuccess, handleUpdateWordFailure)
    })

    wordActionBtnContainer.on("click", "#cancel-update-words-btn", function() {
      clearWordDetailsArea()
      wordActionBtnContainer.html('<button class="create-words-btn save-btn-style">Save</button>')
    })

    // delete word
    let handleDeleteWordSuccess = function(result) {
      if (result.message) {
        toastMessage.showMessage(result.message, SUCCESS_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("The list deleted", SUCCESS_MESSAGE_TYPE)
      }
      getWords(listComponent.getCurrentListInfo().listId)
    }

    let handleDeleteWordFailure = function(error) {
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

    return {
      getWords
    }

  })()

})