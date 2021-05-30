$(".start-lesson-btn").click(function(){
  $.getJSON("/learn_vocab", function(result){
    var num = 0;
    localStorage.setItem("num", num+1);
    $.each(result, function(i, field){
      var data = [i, field];
      localStorage.setItem(num, JSON.stringify(data));
      console.log(num, field);
      num = num + 1;
    });
    localStorage.setItem("length", num);
    data = JSON.parse(localStorage.getItem(0))
    $(".viet-word").html(data[1]);
    $(".viet-word").attr('id', data[0])
  });
});

$(".next-word").click(function(){
  var num_str = localStorage.getItem("num");
  // if (num == localStorage.getItem("length")) {
    
  // }
  num = parseInt(num_str);
  data = JSON.parse(localStorage.getItem(num))
  $(".viet-word").html(data[1]);
  $(".viet-word").attr('id', data[0])
  localStorage.setItem("num", num+1);
});
