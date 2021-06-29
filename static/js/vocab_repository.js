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

// $(".create-a-list-btn").click(function() {
//   rmInputRedundantSpaces("#list-of-word-lists");
//   var listName = $("#list-of-word-lists").val();
//   if (listName.length > 50 ) {
//     showMessage("The list's name must less than 50 characters.", 'error');
//     return false
//   }
//   $.post("/lists", { list_name: $("#list-of-word-lists").val() })
//   .done(function(result){
//     $("#list-of-lists").append(`<option list-id="${result.list_id}" value="${result.list_name}">`)
//     showMessage(`The list ${result.list_name} was saved successfully.`, 'success');
//     $(".create-a-list-btn").addClass("disabled");
//     $(".add-words-container").removeClass("disabled");
//   })
//   .fail(function(error) {
//     if (error.responseJSON) {
//       showMessage(error.responseJSON.erMsg, 'error');
//     } else {
//       showMessage("Cannot create the list.", 'error');
//     }
//   });
// });

$(".add-more-eng-word-field").click(function() {
  $(".more-eng-field").append(`
  <div class="field">
    <input class="eng-word" type="text" name="eng-word"/><br>
  </div>
  `);
});

$(".create-words-btn").click(function() {
  rmInputRedundantSpaces("#list-of-word-lists");
  var listName = $("#list-of-word-lists").val();
  var selected_option = $("#list-of-lists").find("option[value='" + listName + "']");
  var listId = selected_option.attr("list-id");
  rmInputRedundantSpaces(".viet-word");
  var data = $('.eng-word').map(function() {
    rmInputRedundantSpaces(this);
    return this.value;
  }).get();
  $.post(`/lists/${listId}/words`, { 
    viet: $(".viet-word").val(),
    engs: JSON.stringify(data)
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
  var listId = $(this).attr("list-id");
  var listName = $(this).attr("list-name");
  $.getJSON(`/lists/${listId}/words`)
  .done(function(result){
    $(".list-content").css("display", "block");
    $(".header-content-of-a-list").children("h2").html(listName);
    $(".header-content-of-a-list").attr("list-id", listId);
    $(".header-content-of-a-list").attr("list-name", listName);
    $(".management-list-btn-container").removeClass("disabled");
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
  $.getJSON(`/words/${$(this).attr("value")}`)
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
    $("#list-of-word-lists").val($(".header-content-of-a-list").attr("list-name"));
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

$(".delete-list-btn").click(function() {
  let listId = $(".header-content-of-a-list").attr("list-id");
  let listName = $(".header-content-of-a-list").attr("list-name");
  $(".item-delete").html(`Are you sure to delete ${listName}?`);
  $(".item-delete").attr("list-id", listId);
  $("#sure-delete").click(function() {
    deleteList(listId);
  });
  $("#confirm-delete-dialog").css("display", "block");
});

function deleteList(listId) {
  $.ajax({
    url: `/lists/${listId}`,
    type: 'DELETE',
    success: function(result) {
      if (result.message) {
        showMessage(result.message, 'success');
      } else {
        showMessage("The list deleted.", 'success');
      }
      location.reload();
    },
    error: function(error) {
      if (error.responseJSON) {
        showMessage(error.responseJSON.erMsg, 'error');
      } else {
        showMessage("Delete list failed.", 'error');
      }
    }
  });
}

$(".add-words-btn").click(function() {
  clearDetailViet();
  $("#list-of-word-lists").val($(".header-content-of-a-list").children("h2").text().trim());
  $("#list-of-word-lists").trigger("keyup");
  $([document.documentElement, document.body]).animate({
      scrollTop: $(".action-container").offset().top
  }, 100);
});
