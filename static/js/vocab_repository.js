$("#list-of-word-lists").keyup(function() {
  var listName = rmRedundantSpaces($(this).val());
  if (!listName) {
    $(".create-a-list-btn").addClass("disabled");
    $(".add-words-container").addClass("disabled");
    return false;
  }
  var validation_list_name = $("#list-of-lists").find("option[value='" + listName + "']");
  if (validation_list_name && validation_list_name.length > 0) {
    $(".create-a-list-btn").addClass("disabled");
    $(".add-words-container").removeClass("disabled");
  } else {
    $(".create-a-list-btn").removeClass("disabled");
    $(".add-words-container").addClass("disabled");
  }
});

$(".create-a-list-btn").click(function() {
  rmInputRedundantSpaces("#list-of-word-lists");
  $.post("/create-list", { list_name: $("#list-of-word-lists").val() })
  .done(function(result){
    $("#list-of-lists").append(`<option value="${result.list_name}">`)
    showMessage(`The list ${result.list_name} was saved successfully.`, 'success');
    $(".create-a-list-btn").addClass("disabled");
    $(".add-words-container").removeClass("disabled");
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot create the list.", 'error');
    }
  });
});

$(".add-more-eng-word-field").click(function() {
  $(".more-eng-field").append(`
  <div class="field">
    <input class="eng-word" type="text" name="eng-word"/><br>
  </div>
  `);
});

$(".create-words-btn").click(function() {
  rmInputRedundantSpaces("#list-of-word-lists");
  rmInputRedundantSpaces(".viet-word");
  var data = $('.eng-word').map(function() {
    rmInputRedundantSpaces(this);
    return this.value;
  }).get();
  $.post("/save-words", { 
    viet: $(".viet-word").val(),
    engs: JSON.stringify(data),
    list_name: $("#list-of-word-lists").val()
  })
  .done(function(result){
    $(".more-eng-field").html('');
    showMessage(result.message, 'success');
    $(".viet-word").val('');
    $(".eng-word").val('');
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot create the words.", 'error');
    }
  });
});
