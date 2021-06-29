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
        <tr class="words-table-item" value="${word.viet_id}">
          <td>${index+1}</td>
          <td>${word.viet_word}</td>
          <td>${tdEng.join(", ")}</td>
          <td><a class="delete-word-btn"><img class="img-word-actions" src="/static/public/trash.png"></a></td>
          <td><a class="edit-word-btn"><img class="img-word-actions" src="/static/public/edit.png"></a></td>
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
  })
  .fail(function(error) {
    if (error.responseJSON) {
      showMessage(error.responseJSON.erMsg, 'error');
    } else {
      showMessage("Cannot get the Vietnamese word.", 'error');
    }
  });
});

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

