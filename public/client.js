// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$( document ).ready(function() {
    console.log( "I am ready on the Front End!!" );
});

function submitUrl(e){
  e.preventDefault();
  console.log($("#usr").val())
  let win = window.open("https://www.google.com/", '_blank');
  win.focus();
  return false;
}
$('#urlSubmitForm').submit(function (e) {
        e.preventDefault();
        let win = window.open("http://localhost:3000/input/"+($("#usr").val()), '_blank');
});
