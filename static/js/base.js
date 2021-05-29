function onClickLearn(p1, p2) {
    console.log("Hello");
    console.log("Goodbye!");
    change_words();
}
var i = 1;
function change_words() {         //  create a loop function
  setTimeout(function() {   //  call a 3s setTimeout when the loop is called
    console.log('hello');   //  your code here
    i++;                    //  increment the counter
    if (i < 10) {           //  if the counter < 10, call the loop function
      change_words();             //  ..  again which will trigger another
    }                       //  ..  setTimeout()
  }, 3000)
}

function showMessage(message) {
    alert(message);
}



