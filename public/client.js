// client-side js
// run by the browser each time your view template is loaded
$('#urlSubmitForm').submit(function (e) {
        e.preventDefault();
        let win = window.open(window.location.href+"input/"+($("#usr").val()), '_blank');
        win.focus();
});
