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
  var listName = $("#list-of-word-lists").val();
  if (listName.length > 50 ) {
    showMessage("The list's name must less than 50 characters.", 'error');
    return false
  }
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

$(".a-list-value").click(function() {
  clearDetailViet();
  var listName = rmRedundantSpaces($(this).children(".list-name-value").text());
  $.getJSON("/get-all-words-in-a-list", { list_name: listName })
  .done(function(result){
    $(".header-content-of-a-list").html(`<h2>${listName}</h2>`);
    $(".list-content-table").html(`
      <tr>
        <th>No</th>
        <th>Vietnamese</th>
        <th>English</th>
      </tr>
    `);
    $.each(result.viets, function(index, word) {
      var tdEng = [];
      $.each(word.eng_words, function(index, eng) {
        tdEng.push(eng.eng_word);
      });
      $(".list-content-table").append(`
        <tr class="words-table-item" value="${word.viet_id}">
          <td>${index+1}</td>
          <td>${word.viet_word}</td>
          <td>${tdEng.join(", ")}</td>
        </tr>
      `);
    });
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot get the words.", 'error');
    }
  });
});

function clearDetailViet() {
  $("input#viet-word").val('');
  $("input.eng-word").val('');
  $(".more-eng-field").html('');
  $("#list-of-word-lists").val('');
  $("#list-of-word-lists").trigger("keyup");
}

$(".list-content-table").on("click", "tr.words-table-item", function() {
  clearDetailViet();
  $.getJSON("/get-viet-word-in-a-list", {"viet_id": $(this).attr("value")})
  .done(function(result) {
    $("input#viet-word").val(result.viet_word);
    $("input.eng-word").val(result.eng_words[0].eng_word);
    if (result.eng_words.length>1) {
      $.each(result.eng_words.slice(1), function(index, eng) {
        $(".more-eng-field").append(`
          <div class="field">
            <input class="eng-word" type="text" name="eng-word" value="${eng.eng_word}"/><br>
          </div>
        `);
      });
    }
    $("#list-of-word-lists").val($(".header-content-of-a-list").text());
    $("#list-of-word-lists").trigger("keyup");
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot get the Vietnamese word.", 'error');
    }
  });
});
