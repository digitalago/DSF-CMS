/**
 * @file
 * Helper js to instantiate compare tool.
 */
(function ($, Drupal) {
  var selectedIds = [];
  Drupal.behaviors.collection_miradorBehavior =  {
    attach: function (context, settings) {
    resetCompare();
    var compareLinks = $('.compare-link-wrapper a');
    // array of selected object ids for comparison.
    var launchCompare = $('.compare-btn');
    // attaching events.
    if (compareLinks.length) {
      compareLinks.each(function() {
        $(this).unbind('click');
        $(this).on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var objectId = $(this).attr('id');
          if (objectId.length) {
            addToCompare(objectId);
          }
        });
      });
    }
    if (launchCompare.length) {
      launchCompare.unbind('click');
      launchCompare.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (selectedIds.length) {
          if ($('#views-exposed-form-objects-my-collections').length) {
            window.location.href ='/mirador/compare?objects=' + selectedIds.toString() + '&&my_collection=1';
          }
          else {
            window.location.href ='/mirador/compare?objects=' + selectedIds.toString();
          }
        }
        else {
          alert('Please select some objects to compare!');
        }
      });
    }
    // Helper function to add object for comparison.
    function addToCompare(objectId) {
      if (selectedIds.length < 4) {
        selectedIds.push(objectId);
      }
      else {
        var removed = selectedIds.shift();
        if ($.inArray(removed, selectedIds) == -1) {
          $('.object-' + removed).removeClass('compare-selected');
        }
        selectedIds.push(objectId);
      }
      $('.object-' + objectId).removeClass('compare-selected').addClass('compare-selected-middle');
      setTimeout(function(){
        $('.object-' + objectId).removeClass('compare-selected-middle').addClass('compare-selected');
      }, 300);
      var storage = $('.compare-toolbox-wrapper .compare-objects');
      if (storage.length && selectedIds.length) {
        var html = '<ul>';
        var selectedObject;
        for (var i = 0; i < selectedIds.length; i++) {
          selectedObject = $('.views-field-title-1 .' + selectedIds[i] + ' a');
          if (selectedObject.length) {
            html += '<li class="' + selectedIds[i] + '"><a href="#">' + '<span class="element-invisible">close</span>' + selectedObject.text() + '</a></li>';
          }
        }
        html += '</ul>';
        storage.html(html);
        // attaching events.
        var storageLinks = $('.compare-toolbox-wrapper .compare-objects ul li a');
        if (storageLinks.length) {
          storageLinks.each(function() {
            $(this).unbind('click');
            $(this).on('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              removeFromCompare(e);
            });
          });
        }
      }
    }

    // Helper function to remove object from comparison.
    function removeFromCompare(clickedObject) {
      if (clickedObject.target) {
        var id = $(clickedObject.target).parent().attr('class');
        for (var i = 0; i < selectedIds.length; i++) {
          if (selectedIds[i] == id) {
            $('.object-' + id).removeClass('compare-selected');
            selectedIds.splice(i, 1);
          }
        }
        $(clickedObject.target).parent().remove();
      }
    }

    // Helper function to reset compare toolbox if filtering is used.
    function resetCompare() {
      var storage = $('.compare-toolbox-wrapper .compare-objects');
      storage.html('');
    }
  }
};

 $(function() {
    if ($('#views-exposed-form-objects-page-1').length) {
      $('#views-exposed-form-objects-page-1')[0].reset();
    }
    else {
      if ($('#views-exposed-form-objects-my-collections').length) {
        $('#views-exposed-form-objects-my-collections')[0].reset();
      }
    }
    selectedIds = [];
 });

})(jQuery, Drupal);
