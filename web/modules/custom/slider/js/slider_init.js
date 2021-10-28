(function ($, Drupal) {
  $('.field--name-field-slider-items .slick-current img').show();
  $(document).ready(function() {
    $('.field--name-field-slider-items').each(function(key) {
      var classes = $(this).parents('article').attr('class').split(/\s+/);
      var nid;
      for (var i = 0; i < classes.length; i++) {
        if (classes[i].indexOf('node-id') !== -1) {
          nid = classes[i].replace('node-id-', "");
        }
      }
      var arrows = true;
      var autoplay = true;
      var bullets = false;
      var timer = 600;
      var effect = false;
      if (drupalSettings.slider_classes[nid]) {
        if (drupalSettings.slider_classes[nid].arrows) {
          switch (drupalSettings.slider_classes[nid].arrows) {
            case 'hide_arrows':
              arrows = false;
              break;
            case 'arrows_inside':
              prevArrow = '<button type="button" class="slick-prev arrow-inside">Previous</button>';
              nextArrow = '<button type="button" class="slick-next arrow-inside">Next</button>';
              break;
            case 'arrows_outside':
              prevArrow = '<button type="button" class="slick-prev arrow-outside">Previous</button>';
              nextArrow = '<button type="button" class="slick-next arrow-outside">Next</button>';
              break;
          }
        }
        if (drupalSettings.slider_classes[nid].autoplay && drupalSettings.slider_classes[nid].autoplay == 'autoplay') {
          autoplay = true;
        }
        else {
          autoplay = false;
        }
        if (drupalSettings.slider_classes[nid].pager) {
          switch (drupalSettings.slider_classes[nid].pager) {
            case 'hide_bullets':
              bullets = false;
              break;
            case 'show_bullets':
              bullets = true;
              break;
          }
        }
        if (drupalSettings.slider_classes[nid].transitions && drupalSettings.slider_classes[nid].transitions == 'fade') {
          effect = true;
        }
        if (drupalSettings.slider_classes[nid].timer) {
          timer = parseInt(drupalSettings.slider_classes[nid].timer);
        }
      }

      var sliderIdName = 'slider' + key;
      $(this).id = sliderIdName;
      $('.field--name-field-slider-items')[key].id = sliderIdName;
      var sliderId = '#' + sliderIdName;
        $(sliderId).slick({
          autoplay: autoplay,
          infinite: true,
          arrows: arrows,
          dots: bullets,
          autoplaySpeed: timer,
          fade: effect,
          appendArrows: $(this).parent().find('.slider-nav-controls'),
          appendDots: $(this).parent().find('.slider-nav-controls')
        });
        // $('.field--name-field-slider-items').css('visibility','visible');
    });
  });
  $('.field--name-field-slider-items').css('opacity','1');
})(jQuery, Drupal);
