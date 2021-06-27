$(".search-btn").click(function() {
  $(".no-data").css("display", "none")
  rmInputRedundantSpaces("#list-of-word-lists");
  let listName = $("#list-of-word-lists").val();
  if (!listName) {
    return false;
  }
  $.getJSON("/search/lists", { list_name: listName })
  .done(function(result) {
    $(".lists-cards-container").html('');
    if (result.lists.length === 0) {
      $(".no-data").css("display", "block");
      return false;
    }
    $.each(result.lists, function(id, list) {
      $(".lists-cards-container").append(
        `<div class="card-of-list">
            <div class="card-title">
                <img class="img-title" src="/static/public/bird.png">
            </div>
            <div class="card-content">
                <div class="name-of-list text-overflow-dot">${list.list_name}</div>
                <div class="property-of-list">
                    ${list.num_viets} words
                </div>
            </div>
            <div class="card-footer">
                <a class="quiz-list-btn" href="/lesson">Quiz</a>
                <a class="edit-list-btn" href="/vocab-repository">Edit</a>
            </div>
        </div>`
      );
    });
  })
  .fail(function() {

  });
})