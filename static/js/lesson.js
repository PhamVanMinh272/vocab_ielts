localStorage.clear();

$(".start-lesson-btn").click(function(){
  // toastMessage.clearMessages();
  rmInputRedundantSpaces("#quantity-of-words-input-id");
  // check quantity field
  var numOfWords = $("#quantity-of-words-input-id").val();
  var regex=/^[0-9]+$/;
  if (!numOfWords) {
    numOfWords = 20;
  } else if (!numOfWords.match(regex)) {
    toastMessage.showMessage("The field number of words is not valid.", errorCategory);
    return false;
  } else if (numOfWords === 0) {
    toastMessage.showMessage("The field number of words is not valid.", errorCategory);
    return false;
  }
  // check lists field
  var listId = $(".list-name-title").attr("list-id");
  // send request
  word.callGetLessonApi(listId, numOfWords)
});

$(".next-word").click(function(){
  var noStr = localStorage.getItem("no");
  var no = parseInt(noStr);
  no = no + 1;
  localStorage.setItem("no", no);
  managePreviousNextBtn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data.word);
  $(".viet-word").attr('id', data.id);
});

$(".previous-word").click(function(){
  var noStr = localStorage.getItem("no");
  var no = parseInt(noStr);
  no = no - 1;
  localStorage.setItem("no", no);
  managePreviousNextBtn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data.word);
  $(".viet-word").attr('id', data.id);
});

function managePreviousNextBtn(no) {
  var length_viet_words = parseInt(localStorage.getItem("length_viet_words"));
  $(".learning-progress").html("Progress: " +  no + "/" + length_viet_words);
  if (length_viet_words == 1) {
    $(".previous-word").attr('disabled', true);
    $(".next-word").attr('disabled', true);
  } else if (no === 1) {
    $(".previous-word").attr('disabled', true);
    $(".next-word").attr('disabled', false);
  } else if (no === length_viet_words) {
    $(".previous-word").attr('disabled', false);
    $(".next-word").attr('disabled', true);
  } else {
    $(".previous-word").attr('disabled', false);
    $(".next-word").attr('disabled', false);
  }
};

$(".check-vocab-btn").click(function(){
  var data = $('.user-eng-answer').map(function() {
    rmInputRedundantSpaces(this);
    return {id_input: this.id, eng_word: this.value};
  }).get();
  word.callCheckVocabApi(data)
});

$(".user-answer-container").click(function() {
  $(".user-eng-answer").css("background-color", "white");
});

// clear the answwer area when click previous btn, next btn, start lesson btn
$(".previous-word, .next-word, .start-lesson-btn").click(function() {
  $(".user-answer-container").html('<input id="user-eng-answer-1" placeholder="Type your answer" class="user-eng-answer" type="text" name="eng-words"/> <br>');
  $(".answers").html("");
});

$(".add-more-user-answer-field").click(function() {
  var num = parseInt(localStorage.getItem("num_user_answer_input")) + 1;
  localStorage.setItem("num_user_answer_input", num)
  $(".user-answer-container").append(
      '<input id="user-eng-answer-' + num + '" class="user-eng-answer" type="text" name="eng-words" placeholder="Type your answer"/> <br>'
    );
  $(".user-eng-answer").css("background-color", "white");
});
