$('#cps').on('keyup', function () {
  if ($('#ps').val() === $('#cps').val()) {
    $('#message').html('Password Match').css('color', 'green');
    $("#regButton").removeAttr('disabled');
  } else
    $('#message').html('Password does not match').css('color', 'red');
});
