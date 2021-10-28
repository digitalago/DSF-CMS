/**
 * @file
 * A JavaScript file for the Facet Modals.
 */
(function ($, Drupal) {
  $('.collection-btn-back').on('click', collectionReturn);
  function collectionReturn(fallbackUrl) {
    fallbackUrl = '/node/4297';
    var prevPage = window.location.href;
    window.history.go(-1);
    setTimeout(function() {
      if (window.location.href == prevPage) {
        window.location.href = fallbackUrl; 
      }
    }, 500);
  }
})(jQuery, Drupal);
