/**
 * @file
 * A JavaScript file for the Collection List or Grid display button.
 */

(function($) {
  Drupal.behaviors.listGridBehavior =  {
    attach: function (context, settings) {
      var listGridButton = $('.block-view-list-grid-block');
      var listButton = $('.list-view-control');
      var gridButton = $('.grid-view-control');
      if (gridButton.length && gridButton.hasClass('active')) {
        $('.view-id-collection_search').addClass('views-list');
        $('.view-id-collection_search .view-content .views-row').addClass("views-row-list");
      }
      listGridButton.unbind('click');
      listGridButton.on('click', function(e) {
        $('.view-id-collection_search').toggleClass('views-list');
        $('.view-id-collection_search .view-content .views-row').toggleClass("views-row-list");
        // Add or Remove active class depending on button clicked.
        if (listButton.hasClass('active')) {
          listButton.removeClass('active');
          gridButton.addClass('active');
        }
        else if (gridButton.hasClass('active')) {
          gridButton.removeClass('active');
          listButton.addClass('active');
        }
      });
    }
  }
})(jQuery);
