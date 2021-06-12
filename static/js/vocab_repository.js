$("#add-words-form").submit(function() {
  rmInputRedundantSpaces("#viet");
  rmInputRedundantSpaces("#engs");
  return true
});

$("#save-list-name-btn").click(function() {
  rmInputRedundantSpaces("#list-name-input");
  $.getJSON("/check_vocab", { viet_id: $(".viet-word").attr('id'), eng_words: JSON.stringify(data) })
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
  });
    
});
