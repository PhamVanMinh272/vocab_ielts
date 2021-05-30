$(".start-lesson-btn").click(function(){
  $.getJSON("/learn_vocab", function(result){
    if (Object.keys(result).length == 0) {
      var html = '<div class="error-message message"> \
                    No words to learn. \
                    <span class="closebtn" onclick="this.parentElement.style.display="none";">&times;</span> \
                  </div> '
      $('.messages-container').html(html);
    } else {
      var no = 1;
      localStorage.setItem("no", no);
      $.each(result, function(i, field){
        var data = [i, field];
        localStorage.setItem(no, JSON.stringify(data));
        no = no + 1;
      });
      $(".lesson-area").removeClass("disabled");
      localStorage.setItem("length_viet_words", no-1);
      manage_previous_next_btn(1);
      data = JSON.parse(localStorage.getItem(1));
      $(".viet-word").html(data[1]);
      $(".viet-word").attr('id', data[0]);
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
  $(".viet-word").html(data[1]);
  $(".viet-word").attr('id', data[0])
});

$(".previous-word").click(function(){
  var no_str = localStorage.getItem("no");
  var no = parseInt(no_str);
  no = no - 1;
  localStorage.setItem("no", no);
  manage_previous_next_btn(no);
  data = JSON.parse(localStorage.getItem(no))
  $(".viet-word").html(data[1]);
  $(".viet-word").attr('id', data[0])
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

localStorage.clear();
