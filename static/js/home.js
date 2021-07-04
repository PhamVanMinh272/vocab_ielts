$(".list-details-btn").click(function() {
  var listId = $(this).attr("list-id");
  var listName = $(this).attr("list-name");
  showListDetail(listId, listName);
});

function getListWords(listId, listName) {
  list.showListWords(listId, listName)
}

function showListDetail(listId, listName) {
  getListWords(listId, listName);
  $("#manage-list-dialog").show();
}

// list detail dialog
$(".list-content-table").on("click", ".edit-word-btn", function() {
  let vietId = $(this).attr("viet-id")
  word.callGetWordApi(vietId)
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
  word.callUpdateApi(vietId, vietWord, engWords, newEngWords)
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
  word.callCreateApi(listId, listName, data)
});

$("#words-table").on("click", ".delete-word-btn", function() {
  let vietId = $(this).attr("viet-id");
  let vietWord = $(this).attr("viet-word");
  deleteConfirmation.showDeleteConfirmation(vietId, vietWord, word.callDeleteWordApi)
});

$(".delete-list-btn").click(function() {
  let listId = $(this).attr("list-id")
  let listName = $(this).attr("list-name")
  list.deleteList(listId, listName)
});

$(".list-more-action-dropbtn").click(function(e) {
  e.stopPropagation();
  $(".list-more-action-dropdown").hide();
  $(this).next().slideToggle(200);
});

function clearDetailViet() {
  $("input#viet-word").val('');
  $("#default-eng-word-field").show();
  $("input.eng-word").val('');
  $(".more-eng-field").html('');
}
