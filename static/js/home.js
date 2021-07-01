$(".edit-list-btn").click(function() {
  var listId = $(this).attr("list-id");
  var listName = $(this).attr("list-name");
  showListDetail(listId, listName);
});

function getListWords(listId, listName) {
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
        <th>Delete</th>
        <th>Edit</th>
      </tr>
    `);
    $.each(result.viets, function(index, word) {
      var tdEng = [];
      $.each(word.eng_words, function(index, eng) {
        tdEng.push(eng.eng_word);
      });
      $(".list-content-table").append(`
        <tr class="words-table-item" viet-id="${word.viet_id}" viet-word="${word.viet_word}">
          <td>${index+1}</td>
          <td>${word.viet_word}</td>
          <td>${tdEng.join(", ")}</td>
          <td><a viet-id="${word.viet_id}" viet-word="${word.viet_word}" class="delete-word-btn"><img class="img-word-actions" src="/static/public/trash.png"></a></td>
          <td><a viet-id="${word.viet_id}" viet-word="${word.viet_word}" class="edit-word-btn"><img class="img-word-actions" src="/static/public/edit.png"></a></td>
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
}

function showListDetail(listId, listName) {
  getListWords(listId, listName);
  $("#manage-list-dialog").css("display", "block");
}

// list detail dialog
$(".list-content-table").on("click", ".edit-word-btn", function() {
  let vietId = $(this).attr("viet-id")
  $.getJSON(`/words/${vietId}`)
  .done(function(result) {
    clearDetailViet();
    $("#add-update-btn-container").html(
      `
        <button id="cancel-update-words-btn">Cancel</button>
        <button id="update-words-btn" viet-id="${vietId}">Update</button>
      `
    )
    $("input#viet-word").val(result.viet_word);
    $("#default-eng-word-field").css("display", "none");
    if (result.eng_words.length>0) {
      $.each(result.eng_words, function(index, eng) {
        $(".more-eng-field").append(`
          <div class="field">
            <input class="eng-word" type="text" name="eng-word" engId="${eng.eng_id}" value="${eng.eng_word}"/><br>
          </div>
        `);
      });
    }
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot get the Vietnamese word.", 'error');
    }
  });
});

$("#add-update-btn-container").on("click", "#update-words-btn", function() {
  let vietId = $(this).attr("viet-id")
  let vietWord = $(".viet-word").val()
  rmInputRedundantSpaces(".viet-word")
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
  }).get()
  $.ajax({
    url: `/words/${vietId}`,
    type: 'PUT',
    data: {
      viet_word: vietWord,
      eng_words: JSON.stringify(engWords),
      new_eng_words: JSON.stringify(newEngWords)
    },
    success: function(result) {
      if (result.message) {
        showMessage(result.message, 'success');
      } else {
        showMessage("The words was updated.", 'success');
      }
      let listId = $(".header-content-of-a-list").attr("list-id");
      let listName = $(".header-content-of-a-list").attr("list-name");
      getListWords(listId, listName);
    },
    error: function(error) {
      if (error.responseJSON) {
        showMessage(error.responseJSON.erMsg, 'error');
      } else {
        showMessage("Update words failed.", 'error');
      }
    }
  });
})

$("#add-update-btn-container").on("click", "#cancel-update-words-btn", function() {
  clearDetailViet()
  $("#add-update-btn-container").html('<button class="create-words-btn">Save</button>')
})

$(".add-more-eng-word-field").click(function() {
  $(".more-eng-field").append(`
  <div class="field">
    <input class="eng-word" type="text" name="eng-word" placeholder="English"/><br>
  </div>
  `);
});

$(".create-words-btn").click(function() {
  let listId = $(".header-content-of-a-list").attr("list-id");
  let listName = $(".header-content-of-a-list").attr("list-name");
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
    getListWords(listId, listName);
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot create the words.", 'error');
    }
  });
});

$("#words-table").on("click", ".delete-word-btn", function() {
  let vietId = $(this).attr("viet-id");
  let vietWord = $(this).attr("viet-word");
  $(".item-delete").html(`Are you sure to delete ${vietWord}?`);
  $(".item-delete").attr("viet-id", vietId);
  $("#sure-delete").click(function() {
    deleteVietWord(vietId);
  });
  $("#confirm-delete-dialog").css("display", "block");
});

function deleteVietWord(vietId) {
  $.ajax({
    url: `/words/${vietId}`,
    type: 'DELETE',
    success: function(result) {
      if (result.message) {
        showMessage(result.message, 'success');
      } else {
        showMessage("The list deleted.", 'success');
      }
      let listId = $(".header-content-of-a-list").attr("list-id");
      let listName = $(".header-content-of-a-list").attr("list-name");
      getListWords(listId, listName);
    },
    error: function(error) {
      if (error.responseJSON) {
        showMessage(error.responseJSON.erMsg, 'error');
      } else {
        showMessage("Delete word failed.", 'error');
      }
    }
  });
}

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

function clearDetailViet() {
  $("input#viet-word").val('');
  $("input.eng-word").val('');
  $(".more-eng-field").html('');
}
