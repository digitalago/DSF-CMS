/**
 * @file
 * A JavaScript file for the Facet Modals.
 */

(function ($, Drupal) {
  Drupal.behaviors.accordion = {
    attach: function (context, settings) {
      $(".block-facets-ajax .facets-widget-checkbox h3").once().each(function () {
        $(this).on('click', toggleFacet);
        $(this).on('keypress', function (e) {
          if (e.which == 13 || e.which == 32) {
            toggleFacet();
          }
        });
        if ($(this).siblings('ul').hasClass('facet-active')) {
          openFacet($(this));
        }
        else {
          closeFacet($(this));
        }
      });
    }
  };

  function toggleFacet() {
    if ($(this).hasClass('accordion-open')) {
      closeFacet($(this));
    } else {
      openFacet($(this));
    }
  }

  function closeFacet(element) {
    element.siblings('ul').slideUp('fast');
    element.attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-expanded', 'false')
      .attr('aria-label', ' Click to expand the content');
    element.addClass('accordion-closed')
      .removeClass('accordion-open');
    element.parent().removeClass('active');
  }

  function openFacet(element) {
    element.siblings('ul').slideDown('fast');
    element.attr('aria-expanded', 'true')
      .attr('aria-label', 'Click to hide the content')
      .removeClass('accordion-closed')
      .addClass('accordion-open');
    element.parent().addClass('active');
  }

})(jQuery, Drupal);
