/**
 * @file
 * Helper js to add some extra functionality for the object page.
 */
(function ($, Drupal) {
  $('.field-group-accordion-wrapper').each(function() {
    var btn = $('<span class="expand-all-object">Expand All</span>').insertAfter($(this));
    var that = $(this);
    btn.on('click', function() {
    if ($(this).hasClass('expanded')) {
      that.accordion({
        collapsible: true,
        active: false
      });
      that.find('.ui-accordion-header').next().slideUp();
      that.find('.field-group-format-toggler').each(function() {
        if ($(this).hasClass('accordion-open')) {
          // Header.
          $(this).removeClass('accordion-open ui-state-active');
          //Icon.
          $(this).find('span').removeClass('ui-icon-triangle-1-s');
          $(this).find('span').addClass('ui-icon-triangle-1-e');

        }
      });
      $(this).removeClass('expanded');
      $(this).text('Expand All');
      }
      else {
        that.find('.ui-accordion-header:not(.ui-state-active)').next().slideDown();
        that.find('.field-group-format-toggler').each(function() {
          if (!$(this).hasClass('accordion-open')) {
            // Header.
            $(this).addClass('accordion-open ui-state-active');
            // Icon.
            $(this).find('span').removeClass('ui-icon-triangle-1-e');
            $(this).find('span').addClass('ui-icon-triangle-1-s');
          }
        });
        $(this).addClass('expanded');
        $(this).text('Collapse All');
      }
    });
  });
  if (!$('article').hasClass('no-zoom')) {
    $('.zoom-tool-toggle').removeClass('element-invisible');
  }
})(jQuery, Drupal);
