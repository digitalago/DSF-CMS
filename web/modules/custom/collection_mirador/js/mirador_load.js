/**
 * @file
 * Helper js to load the mirador viewer.
 */
(function ($, Drupal) {
      $(function() {
        if (!drupalSettings.collection_mirador.mirador_init.manifests) {
          var manifestUri = drupalSettings.collection_mirador.mirador_init.manifest_name;
          var manifestId = drupalSettings.collection_mirador.mirador_init.manifest_id;
          var nid = drupalSettings.collection_mirador.mirador_init.node_id;
          if ($('#' + manifestId + ' .mirador-viewer').length === 0) {
            attachMirador(manifestId, manifestUri);
            if ($('.panel-listing-thumbs img').length) {
              var imgs = $('.panel-listing-thumbs img');
              imgs.each(function(){
                var src = $(this).getAttribute('data-image-id');
                if (src.length) {
                  $(this).setAttribute('src', src);
                }
              });
            }
            if ($('.mirador-viewer').length) {
              $('.mirador-viewer').append('<div class="exit-zoom"><a id="close-zoom" href="/node/'+ nid +'"><span class="element-invisible">close</span>Exit Zoom Tool</a></div>');
              $('#close-zoom').on('click', function(e){
                if (window.history && window.history.length > 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.history.go(-1);
                }
              });
            }
          }
        }
        else {
          var manifests = drupalSettings.collection_mirador.mirador_init.manifests;
          if (manifests.length) {
            var uris = [];
            for (var i = 0; i < manifests.length; i++) {
              uris.push(manifests[i].manifest_name);
            }
            attachMiradorMultiple('miradorCompare', uris, manifests.length);
            // attaching exit button
            if ($('.mirador-viewer').length && drupalSettings.collection_mirador.mirador_init.my_collection) {
              $('.mirador-viewer').append('<div class="exit-zoom"><a id="close-zoom" href="/user/'+ drupalSettings.user.uid +'/my-collections"><span class="element-invisible">close</span>Close Compare Tool</a></div>');
              $('#close-zoom').on('click', function(e){
                if (window.history && window.history.length > 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.history.go(-1);
                }
              });
            }
            else {
              if ($('.mirador-viewer').length) {
                $('.mirador-viewer').append('<div class="exit-zoom"><a id="close-zoom" href="/collection/browse"><span class="element-invisible">close</span>Close Compare Tool</a></div>');
                $('#close-zoom').on('click', function(e){
                  if (window.history && window.history.length > 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.history.go(-1);
                  }
                });
              }
            }
          }
        }

      });
  /**
   * Attaches mirador viewer to the viewerId Provided.
   */
  function attachMirador(viewerId, manifestUri) {
     Mirador({
        "id": viewerId,
        "layout": "1x1",
        'openManifestsPage' : false,
        'showAddFromURLBox' : false,
        'mainMenuSettings.show': false,
        'mainMenuSettings.buttons.options': false,
        "saveSession": false,
        "annotationLayer": false,
        "annotationCreation": false,
        "data": [
          { "manifestUri": manifestUri, "location": "collection Project"},
        ],
        "mainMenuSettings" : {
          "show" : false
        },
        "windowObjects":[{
          "loadedManifest" : manifestUri,
          "availableViews" : ['ImageView'],
          "viewType" : "ImageView",
          "displayLayout": false,
          "annotationCreation" :false,
          "sidePanel":false,
          "overlay":false,
          "bottomPanelVisible":false,
          "fullScreen": false,
          "layoutOptions": {
            "close": false,
            "slotRight": false,
            "slotLeft": false,
            "slotAbove": false,
            "slotBelow": false
        },
      }],
    });
  }

  /**
   * Attaches mirador viewer to the viewerId with provided pre-configured layout.
   */
  function attachMiradorMultiple(viewerId, manifestUris, layoutNumber) {
    var data = buildManifestUris(manifestUris);
    var layout = getLayoutByNumber(layoutNumber);
    var windowObjects = buildWindowObjects(manifestUris);
    Mirador({
        "id": viewerId,
        "layout": layout,
        'openManifestsPage' : false,
        'showAddFromURLBox' : false,
        'mainMenuSettings.show': false,
        'mainMenuSettings.buttons.options': false,
        "saveSession": false,
        "annotationLayer": false,
        "annotationCreation": false,
        "data": data,
        "mainMenuSettings" : {
          "show" : false
        },
        "windowObjects" : windowObjects
    });
  }

  /**
   * Helper function to get array of formatted window objects.
   */
  function buildWindowObjects(uris) {
    var windowObjects = [];
    if (uris.length) {
      for (var i = 0; i < uris.length; i++) {
        windowObjects[i] = {
          "loadedManifest" : uris[i],
          "availableViews" : ['ImageView'],
          "viewType" : "ImageView",
          "displayLayout": false,
          "annotationCreation" :false,
          "sidePanel":false,
          "overlay":false,
          "bottomPanelVisible":false,
          "fullScreen": false,
        };
      }
    }
    return windowObjects;

  }

  /**
   * Helper function to get array of formatted manifests data.
   */
  function buildManifestUris(uris) {
    var data = [];
    if (uris.length) {
      for (var i = 0; i < uris.length; i++) {
        data[i] = {"manifestUri" : uris[i], "location": "collection Project"};
      }
    }
    return data;
  }

  /**
   * Helper function to get layout configuration option.
   */
  function getLayoutByNumber(layoutNumber) {
    var layout_str;
    switch(layoutNumber) {
      case 1:
        layout_str = "1x1";
      break;
      case 2:
        layout_str = "1x2";
      break;
      case 3:
        layout_str = "2x2";
      break;
      case 4:
        layout_str = "2x2";
      break;
      default:
        layout_str = "2x2";
      break;
    }
    return layout_str;
  }

})(jQuery, Drupal);
