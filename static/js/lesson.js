localStorage.clear();

$(".start-lesson-btn").click(function(){
  clearMessages();
  rmInputRedundantSpaces("#quantity-of-words-input-id");
  // check quantity field
  var numOfWords = $("#quantity-of-words-input-id").val();
  var regex=/^[0-9]+$/;
  if (!numOfWords) {
    numOfWords = 20;
  } else if (!numOfWords.match(regex)) {
    showMessage("The field number of words is not valid.", errorCategory);
    return false;
  } else if (numOfWords === 0) {
    showMessage("The field number of words is not valid.", errorCategory);
    return false;
  }
  // check lists field
  var listId = $(".list-name-title").attr("list-id");
  // send request
  $.getJSON(`/lists/${listId}/words`, {number_of_words: numOfWords, lesson: 1})
  .done(function(result){
    if (result.viets.length == 0) {
      showMessage("No words to learn.", errorCategory);
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
      $(".viet-word").html(data.viet_word);
      $(".viet-word").attr('id', data.id);
      // number of user answer input
      localStorage.setItem("num_user_answer_input", 1);
    };
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot start a lesson.", 'error');
    }
  });
});

$(".next-word").click(function(){
  var noStr = localStorage.getItem("no");
  var no = parseInt(noStr);
  no = no + 1;
  localStorage.setItem("no", no);
  managePreviousNextBtn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data.viet_word);
  $(".viet-word").attr('id', data.id);
});

$(".previous-word").click(function(){
  var noStr = localStorage.getItem("no");
  var no = parseInt(noStr);
  no = no - 1;
  localStorage.setItem("no", no);
  managePreviousNextBtn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data.viet_word);
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
  $.getJSON(`/words/${$(".viet-word").attr('id')}/check-vocab`, { eng_words: JSON.stringify(data) })
  .done(function(result){
    $.each(result.eng_words, function(i, field){
      if (field.status === 1) {
        $("input#"+field.id_input).css("background-color", "#52c41a");
      } else {
        $("input#"+field.id_input).css("background-color", "#f5222d");
      }
    });
    $(".answers").html("");
    $.each(result.eng_data, function(i, field){
      $(".answers").append("<div class='answer'>" + field + "</div>");
    });
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot check the answers.", 'error');
    }
  });
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
