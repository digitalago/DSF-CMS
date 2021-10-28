/**
 * @file
 * A JavaScript file for the Search Facet Modals.
 */

(function ($, Drupal) {
  Drupal.behaviors.modal = {
    attach: function (context, settings) {

      var facetTitle = $('.block-facets-ajax:not("#block-collection") .facets-widget-checkbox a');
      var facetItems = $('.block-facets-ajax:not("#block-collection") .facets-widget-checkbox ul li');
      facetItems.each(function(i){
        if ($(this).css('display') == 'none') {
          $(this).css({'visibility': 'hidden', 'height': 0, 'display': 'none'});
        }
      });

      function openColorbox(e) {
        e.preventDefault();
        e.stopPropagation();
        var modalItems = $(this).siblings('ul').clone();
        modalItems.each(function(){
          $(this).children('.facet-item').removeAttr('style');
          $(this).children('.facet-item').on('click', selectFacet);
        });
        $.colorbox({
          href: modalItems,
          inline: true,
          scrolling: false,
          overflow: 'hidden',
          className: 'colorboxSplash',
          initialWidth: 0,
          overlayClose: false,
          closeButton: true,
        });
        $('#colorbox').addClass('active');
        var title = $(this).siblings('h3').text();
        $('#colorbox').prepend('<div class="collection-modal-filterset-title"><h2>' + title + '</h2></div>');

        var closeButton = $('#colorbox').length == 1;
        if (closeButton) {
          $('#cboxClose').on('click', closeColorbox);
        };
      }

      function selectFacet() {
        var id = $(this).children('input').attr('id');
        $('.region--sidebar-first .facet-item input#' + id).click();
        closeColorbox();
      }

      function closeColorbox(e) {
        $('#colorbox').removeClass('active');
        $('div').remove('.collection-modal-filterset-title');
        $('#cboxOverlay').remove();
        $('#colorbox').remove();
      }

      facetTitle.off('click');
      facetTitle.unbind('click');
      facetTitle.on('click', openColorbox);
      facetTitle.on('keypress', function(e) {
        if (e.which == 13 || e.which == 32) {
          openColorbox();
        }
      });
    }
  };
})(jQuery, Drupal);
