/**
 * @file
 * Helper js to append the search and reset buttons below the facets.
 */
(function ($, Drupal) {
  var $searchExposedForm = $('[data-drupal-selector="views-exposed-form-course-search-courses-grid"]').find('form');
  if ($searchExposedForm.length) {
    $actions = $('#edit-actions--2');
    $actions.insertBefore($('#block-memberssaveoncourses'));
    $submit = $('#edit-submit-course-search');
    $submit.removeClass('js-hide');
    $submit.on('click', function() {
      $searchExposedForm.submit();
    });
  }
})(jQuery, Drupal);