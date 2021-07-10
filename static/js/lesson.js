localStorage.clear()

$(function() {
  let lessonComponent = (function() {
    let currentListId = $(".list-name-title").attr("list-id")
  
    let startLessonBtn = $(".start-lesson-btn")
    let quantityWordsInput = $("#quantity-of-words-input-id")
  
    let lessonArea = $(".lesson-area")
    let vietnameseText = $(".viet-word")
    let addMoreEnglishInputBtn = $(".add-more-user-answer-field")
    let answerContainer = $(".user-answer-container")
    let nextWordBtn = $(".next-word")
    let previousWordBtn = $(".previous-word")
    let lessonProgressInfo = $(".learning-progress")
    let actualAnswerContainer = $(".answers")
    let checkAnswerBtn = $(".check-vocab-btn")
  
    // lesson
    let handleStartLessonFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot start the lesson", ERROR_MESSAGE_TYPE)
      }
    }
  
    let handleStartLessonSuccess = function(result) {
      if (result.viets.length == 0) {
        toastMessage.showMessage("No words to learn", ERROR_MESSAGE_TYPE)
      } else {
        let start_with = 1
        localStorage.setItem("no", start_with)
        $.each(result.viets, function(i, data){
          localStorage.setItem(data.no, JSON.stringify(data))
        });
        localStorage.setItem("length_viet_words", result.viets.length)
        // enable study area and set status for previous and next btn
        lessonArea.show()
        managePreviousNextBtn(start_with)
        // set the first word
        data = JSON.parse(localStorage.getItem(start_with))
        setVietnameseTextValue(data.id, data.word)
        // number of user answer input
        localStorage.setItem("num_user_answer_input", 1)
      }
    }
  
    let getStartLessonInfo = function() {
      rmInputRedundantSpaces("#quantity-of-words-input-id")
      // check quantity field
      let numOfWords = quantityWordsInput.val()
      let regex=/^[0-9]+$/
      if (!numOfWords) {
        numOfWords = DEFAULT_LESSON_WORDS_QUANTITY
      } else if (!numOfWords.match(regex)) {
        toastMessage.showMessage("The field number of words is not valid", ERROR_MESSAGE_TYPE)
        return false
      } else if (numOfWords === 0) {
        toastMessage.showMessage("The field number of words is not valid", ERROR_MESSAGE_TYPE)
        return false
      }
      return {number_of_words: numOfWords, lesson: 1}
    }
  
    startLessonBtn.click(function(){
      let data = getStartLessonInfo()
      // send request
      word.callGetLessonAPI(currentListId, data, handleStartLessonSuccess, handleStartLessonFailure)
    })
  
    let setVietnameseTextValue = function(wordId, wordValue) {
      vietnameseText.html(wordValue)
      vietnameseText.attr('id', wordId)
    }
  
    // add more field
    addMoreEnglishInputBtn.click(function() {
      var num = parseInt(localStorage.getItem("num_user_answer_input")) + 1
      localStorage.setItem("num_user_answer_input", num)
      answerContainer.append(
          '<input id="user-eng-answer-' + num + '" class="user-eng-answer" type="text" name="eng-words" placeholder="Type your answer"/> <br>'
        )
      $(".user-eng-answer").css("background-color", "white")
    })
  
    nextWordBtn.click(function(){
      var noStr = localStorage.getItem("no")
      var no = parseInt(noStr)
      no = no + 1
      localStorage.setItem("no", no)
      managePreviousNextBtn(no)
      data = JSON.parse(localStorage.getItem(no))
      setVietnameseTextValue(data.id, data.word)
    })
  
    
    previousWordBtn.click(function(){
      var noStr = localStorage.getItem("no")
      var no = parseInt(noStr)
      no = no - 1
      localStorage.setItem("no", no)
      managePreviousNextBtn(no)
      data = JSON.parse(localStorage.getItem(no))
      setVietnameseTextValue(data.id, data.word)
    })
  
    let managePreviousNextBtn = function(no) {
      var length_viet_words = parseInt(localStorage.getItem("length_viet_words"))
      lessonProgressInfo.html("Progress: " +  no + "/" + length_viet_words)
      if (length_viet_words == 1) {
        previousWordBtn.attr('disabled', true)
        nextWordBtn.attr('disabled', true)
      } else if (no === 1) {
        previousWordBtn.attr('disabled', true)
        nextWordBtn.attr('disabled', false)
      } else if (no === length_viet_words) {
        previousWordBtn.attr('disabled', false)
        nextWordBtn.attr('disabled', true)
      } else {
        previousWordBtn.attr('disabled', false)
        nextWordBtn.attr('disabled', false)
      }
    }
  
    // clear the answwer area when click previous btn, next btn, start lesson btn
    $(".previous-word, .next-word, .start-lesson-btn").click(function() {
      answerContainer.html('<input id="user-eng-answer-1" placeholder="Type your answer" class="user-eng-answer" type="text" name="eng-words"/> <br>')
      actualAnswerContainer.html("")
    })
  
    answerContainer.click(function() {
      $(".user-eng-answer").css("background-color", "white")
    })
    
    // check answer
    let handleCheckAnswerSuccess = function(result) {
      $.each(result.eng_words, function(i, field){
        if (field.status === 1) {
          $("input#"+field.id_input).css("background-color", "#52c41a")
        } else {
          $("input#"+field.id_input).css("background-color", "#ec6d74")
        }
      });
      actualAnswerContainer.html("")
      $.each(result.eng_data, function(i, field){
        actualAnswerContainer.append("<div class='answer'>" + field + "</div>")
      })
    }
  
    let handleCheckAnswerFailure = function(error) {
      if (error.responseJSON) {
        toastMessage.showMessage(error.responseJSON.erMsg, ERROR_MESSAGE_TYPE)
      } else {
        toastMessage.showMessage("Cannot check the answers", ERROR_MESSAGE_TYPE)
      }
    }
  
    checkAnswerBtn.click(function(){
      let answers = $(".user-eng-answer").map(function() {
        rmInputRedundantSpaces(this)
        return {id_input: this.id, eng_word: this.value}
      }).get()
      let data = { eng_words: JSON.stringify(answers) }
      word.callCheckVocabAPI(vietnameseText.attr("id"), data, handleCheckAnswerSuccess, handleCheckAnswerFailure)
    })
  
  })()
})
