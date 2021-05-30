localStorage.clear();

$(".start-lesson-btn").click(function(){
  $.getJSON("/learn_vocab", function(result){
    if (Object.keys(result).length == 0) {
      var html = '<div class="error-message message"> \
                    No words to learn. \
                    <span class="closebtn" onclick="this.parentElement.style.display="none";">&times;</span> \
                  </div> '
      $('.messages-container').html(html);
    } else {
      var start_with = 1;
      localStorage.setItem("no", start_with);
      $.each(result, function(i, data){
        localStorage.setItem(i, JSON.stringify(data));
      });
      localStorage.setItem("length_viet_words", Object.keys(result).length);
      // enable study area and set status for previous and next btn
      $(".lesson-area").removeClass("disabled");
      manage_previous_next_btn(start_with);
      // set the first word
      data = JSON.parse(localStorage.getItem(start_with));
      $(".viet-word").html(data.viet_word);
      $(".viet-word").attr('id', data.id);
    };
  });
});

$(".next-word").click(function(){
  var no_str = localStorage.getItem("no");
  var no = parseInt(no_str);
  no = no + 1;
  localStorage.setItem("no", no);
  manage_previous_next_btn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data.viet_word);
  $(".viet-word").attr('id', data.id);
});

$(".previous-word").click(function(){
  var no_str = localStorage.getItem("no");
  var no = parseInt(no_str);
  no = no - 1;
  localStorage.setItem("no", no);
  manage_previous_next_btn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data.viet_word);
  $(".viet-word").attr('id', data.id);
});

function manage_previous_next_btn(no) {
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
  $.getJSON("/check_vocab", { viet_id: $(".viet-word").attr('id'), })
  .done(function(result){
    var eng_word = $("#eng-words").val().trim();
    if (Object.values(result).indexOf(eng_word) > -1) {
      $("#eng-words").css("background-color", "#52c41a");
    } else {
      $("#eng-words").css("background-color", "#f5222d");
    }
    $(".answers").html("");
    $.each(result, function(i, field){
      $(".answers").append("<div class='answer'>" + field + "</div>");
    });
  })
  .fail(function(error) {
  });
});

// setback input's background-color to white when click the input, previous btn, next btn, start lesson btn
$("#eng-words, .previous-word, .next-word, .start-lesson-btn").click(function() {
  $("#eng-words").css("background-color", "white");
});

// clear value when click previous btn, next btn, start lesson btn
$(".previous-word, .next-word, .start-lesson-btn").click(function() {
  $("#eng-words").val("");
  $(".answers").html("");
});
