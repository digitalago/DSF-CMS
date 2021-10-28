/**
 * @file
 * Helper js to add functionality for the Accordion Container block.
 */
(function ($, Drupal) {

  function toggleAccordion(e) {
    var toggleAcc = $(e);
    toggleAcc.parent().toggleClass('accordion-open');
    toggleAcc.parent().find('.field--name-field-details').slideToggle('slow');
  }

  function toggleExpand(e) {
    var toggleBtn = $(e);
    $('.node--type-accordion > .node__content').toggleClass('accordion-open');
    toggleBtn.toggleClass('expanded');
    if (toggleBtn.hasClass('expanded')) {
      toggleBtn.html('Collapse All');
      toggleBtn.closest('.field--name-field-accordion ').find('.field--name-field-details').slideDown( "slow" );
    }
    else {
      toggleBtn.html('Expand All');
      toggleBtn.closest('.field--name-field-accordion ').find('.field--name-field-details').slideUp( "slow" );
    }
  }

  $('.node--type-accordion > .node__content').on('click', function(e) {
    toggleAccordion(e.target);
  });

  $('.accordion-expand-all-toggle').on('click', function(e) {
    e.preventDefault();
    toggleExpand(e.target);
  });

  // ++++++++++ FAQ functionality
  $('.block-accordion h2').on('click', function() {
    console.log('click');
    $(this).toggleClass('accordion-plus');
    $(this).parent().find('.sub-accordions-wrapper').slideToggle('slow');
  });

  $('.block-accordion-closed h2').on('click', function() {
    console.log('click');
    $(this).toggleClass('accordion-minus');
    $(this).parent().find('.sub-accordions-wrapper').slideToggle('slow');
  });


})(jQuery, Drupal);
