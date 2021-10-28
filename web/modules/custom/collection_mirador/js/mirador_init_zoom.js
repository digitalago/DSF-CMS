/**
 * @file
 * Helper js to instantiate deep zoom tool.
 */
(function ($, Drupal) {
  $(function() {
    if ($('.loris-img-gallery').length) {
      var objId = $('.loris-img-gallery').attr('id');
      if (objId !== false) {
        objId = objId.substr(3);
        if (objId) {
            if ($('.zoom-tool-toggle').length) {
              $('.zoom-tool-toggle').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href ='/node/' + objId + '/mirador';
              });
            }
            if ($('.webform-link').length) {
              $('.webform-link').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }

                if (mm < 10) {
                    mm = '0' + mm;
                }

                today = mm + '/' + dd +'/'+ yyyy;
                artistName = $('.loris-img-gallery').attr('data-artist');
                objectTitle  = $('.loris-img-gallery').attr('data-title');
                objectNumber  = $('.loris-img-gallery').attr('data-objNumber');
                url = 'https://artgalleryofontario.wufoo.eu/forms/sjupx5f1804pc1/def/';
                if (artistName && artistName.length) {
                  url += 'field125=' + artistName;
                }
                if (objectTitle && objectTitle.length) {
                  url += '&field126=' + objectTitle;
                }
                if (today && today.length) {
                  url += '&field127=' + today;
                }
                if (objectNumber && objectNumber.length) {
                  url += '&field128=' + objectNumber;
                }
                window.open(url, '_blank');
              });
            }
        }
      }
    }
  });

})(jQuery, Drupal);
