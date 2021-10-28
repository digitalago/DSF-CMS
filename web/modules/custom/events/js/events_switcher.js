(function ($, Drupal) {
  var location = window.location.href;
  if (location.indexOf('calendar') !== -1) {
    $('.calendar-btn').addClass('activeBtn');
    $('.browse-btn').removeClass('activeBtn');
  }
  else {
    $('.browse-btn').addClass('activeBtn');
    $('.calendar-btn').removeClass('activeBtn');
  }

})(jQuery, Drupal);

