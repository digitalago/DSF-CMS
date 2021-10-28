//! Mirador 0.9.0
//! Built on 2015-03-27

(function($, jQuery){


var Isfahan = function(configObject) {
  var _this = this,

  containerSize = function(containerId) {
    return [document.getElementById(containerId).offsetWidth,
      document.getElementById(containerId).offsetHeight]
  },
  containerId = configObject.containerId,
  pad = d3_layout_cellPadNull,
  round = Math.round,
  padding = configObject.padding,
  hierarchy = d3.layout.hierarchy(),
  layoutDescription = configObject.layoutDescription;

  function calculateLayout(node) {
    var children = node.children;

    if (children && children.length) {
      var rect = pad(node),
      type = node.type,
      group = [],
      remaining = children.slice(), // copy-on-write
      child,
      n;

      while ((n = remaining.length) > 0) {
        group.push(child = remaining[n - 1]);
        remaining.pop();
      }

      position(group, node.type, rect);
      children.forEach(function(child, index) {
        child.address = node.address.concat("." + child.type + (index + 1));
      })
      children.forEach(calculateLayout);
    }
  }

  // Positions the specified row of nodes. Modifies `rect`.
  function position(group, groupType, rect) {
    // console.log('%c\n'+' parent ' + groupType + ' rect is: ', 'background: #222; color: #EFEFEF; font-family: helvetica neue; font-size:20px; padding: 0 7px 3px 0;');
    // console.log(rect);
    var i = -1,
    row = (groupType === "row") ? false : true, // for ternary statements later, specifies whether that particular child is a row or not. Allows easy, centralised description of the parameter calculations that can be switched from row to column.
    n = group.length,
    x = rect.x,
    y = rect.y,
    o;
    var offset = 0;
    while (++i < n) {
      o = group[n-(i+1)],
      d = divisor(o, row, rect, group, n),
      o.id = typeof o.id !== 'undefined' ? o.id : genUuid(),
      o.x = row ?  x : x + offset,
      o.y = row ? y + offset : y,
      o.dx = row ? rect.dx : rect.dx/d,
      o.dy = row ? rect.dy/d : rect.dy,
      offset += row ? o.dy : o.dx;
      // console.log({x:o.x, y: o.y, width:o.dx, height: o.dy});
    }
  }

  function divisor(node, row, rect, group, n) {

    var old = false,
    dimension = row ? 'dy' : 'dx',
    total = rect[dimension],
    divisor;
    // if not already set, divide equally.
    group.forEach(function(item) {
      if (!item[dimension] === undefined) {
        old = true;
      }
    });

    if (old) {
      console.log('preserved');
      var sum = group.reduce(
        function(previousValue, currentValue, index, array) {
        return previousValue[dimension] + currentValue[dimension];
      });
      console.log('sum: ' + sum);

      divisor = (node[dimension]/sum)*total;
      console.log("divisor: "+divisor);
      return divisor;
    } else {
      return n;
    }
  }

  function isfahan(configObject) {
    var nodes = hierarchy(configObject.layoutDescription),
    root = nodes[0];
    size = (function(containerSelector) {
      var width = jQuery(containerSelector).width();
      var height = jQuery(containerSelector).height();

      return [width, height];
    })(configObject.containerSelector);
    root.x = 0;
    root.y = 0;
    root.dx = containerSize(containerId)[0];
    root.dy = containerSize(containerId)[1];
    root.address = root.type + "1";
    root.id = root.id || genUuid();

    calculateLayout(root);
    isfahan.padding(padding);
    nodes = nodes.map(function(node) {
      return merge(node, pad(node));
    });

    return nodes;
  }

  isfahan.size = function(x) {
    if (!arguments.length) return containerSize;
    containerSize = x;
    return isfahan;
  };

  isfahan.round = function(x) {
    if (!arguments.length) return round != Number;
    round = x ? Math.round : Number;
    return isfahan;
  };

  isfahan.padding = function(x) {
    if (!arguments.length) return padding;

    function padFunction(node) {
      var p = x.call(isfahan, node, node.depth);
      console.log(p);
      return p == null
      ? d3_layout_cellPadNull(node)
      : d3_layout_cellPad(node, typeof p === "number" ? [p, p, p, p] : p);
    }

    function padConstant(node) {
      return d3_layout_cellPad(node, x);
    }

    var type;
    pad = (padding = x) == null ? d3_layout_cellPadNull
    : (type = typeof x) === "function" ? padFunction
    : type === "number" ? (x = [x, x, x, x], padConstant)
    : padConstant;
    return isfahan;
  };

  function genUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  function d3_layout_cellPadNull(node) {
    return {x: node.x, y: node.y, dx: node.dx, dy: node.dy};
  }

  function d3_layout_cellPad(node, padding) {
    var x = node.x + padding[3],
    y = node.y + padding[0],
    dx = node.dx - padding[1] - padding[3],
    dy = node.dy - padding[0] - padding[2];
    if (dx < 0) { x += dx / 2; dx = 0; }
    if (dy < 0) { y += dy / 2; dy = 0; }
    return {x: x, y: y, dx: dx, dy: dy};
  }

  function merge(target, source) {

    /* Merges two (or more) objects,
       giving the last one precedence */

    if ( typeof target !== 'object' ) {
      target = {};
    }

    for (var property in source) {

      if ( source.hasOwnProperty(property) ) {

        var sourceProperty = source[ property ];

        if ( typeof sourceProperty === 'object' ) {
          target[ property ] = util.merge( target[ property ], sourceProperty );
          continue;
        }

        target[ property ] = sourceProperty;

      }

    }

    for (var a = 2, l = arguments.length; a < l; a++) {
      merge(target, arguments[a]);
    }

    return target;
  };

  // return d3.rebind(isfahan, hierarchy,"sort", "children", "value");
  return isfahan(configObject);
};

window.Mirador = window.Mirador || function(config) {

  // pass the config through the save and restore process,
  // returning the config that will, in fact, populate the
  // application.
  Mirador.saveController = new Mirador.SaveController(config);

  config = Mirador.saveController.currentConfig;

  // initialise application
  Mirador.viewer = new Mirador.Viewer(config);
};

/*
 * jQuery Tiny Pub/Sub
 * https://github.com/cowboy/jquery-tiny-pubsub
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));

(function($) {

  /**
   * Default values for settings
   */
  $.DEFAULT_SETTINGS = {

    'workspaceType': 'singleObject',

    'saveSession' : true,  //whether or not to store session to local storage

    'workspaces' : {
      'singleObject': {
        'label': 'Single Object',
        'addNew': false,
        'move': false,
        'iconClass': 'image'
      },
      'compare': {
        'label': 'Compare',
        'iconClass': 'columns'
      },
      'bookReading': {
        'defaultWindowOptions': {
        },
        'label': 'Book Reading',
        'addNew': true,
        'move': false,
        'iconClass': 'book'
      }
    },

    'layout': '1x1',

    'windowObjects' : [
      /** within a single object, the following options:
       *   "loadedManifest": [manifestURI] e.g. "http://dms-data.stanford.edu/data/manifests/Walters/qm670kv1873/manifest.json"
       *   "availableViews" : defaults to ['ThumbnailsView', 'ImageView', 'ScrollView', 'BookView'], any subset removes others
       *   "viewType" : one of ['ThumbnailsView', 'ImageView', 'ScrollView', 'BookView'] - if using availableViews, must be in subset
       *   "canvasID": [canvas URI] e.g. "http://dms-data.stanford.edu/data/manifests/Walters/qm670kv1873/canvas/canvas-12"
       *   "bottomPanel" : [true, false] whether or not to make the bottom panel available/visible in this window
       *   "sidePanel" : [true, false] whether or not to make the side panel available/visible in this window
       *   "overlay" : [true, false] whether or not to make the overlay available/visible in this window
       *   "annotationLayer" : [true, false] whether or not to make annotation layer available in this window
       *   "windowOptions" : [data specific to the view type, such as OSD bounds and zoom level - automatically saved in SaveController]
       *   "id" : [unique window ID - set by application and automatically saved in SaveController]
       *   "displayLayout" : [true, false], whether or not to display all layout options, removing individual menu options is separate
       *   "layoutOptions" : control individual menu items in layout menu. if "displayLayout" is false, these options won't be applied
       *     {
       *     "newObject" : [true, false]
       *     "close" : [true, false]
       *     "slotRight" : [true, false]
       *     "slotLeft" : [true, false]
       *     "slotAbove" : [true, false]
       *     "slotBelow" : [true, false]
       *     }
       **/
    ],

    'defaultWindowSettings': {

    },

    'availableAnnotationModes': [

    ],

    'availableAnnotationDrawingTools': [

    ],

    'availableCanvasTools': [

    ],

    // main (top) menu
    //we don't actually take the height into account for the mirador-viewer div, so don't use for now
    'mainMenuSettings': {
      'show': true,
      'buttons' : {
        'bookmark' : true,
        'layout' : true,
        'options' : false
      }
      //'height': 25,
      //'width': '100%'
    },

    'workspacePanelSettings': {
      'maxRows': 5,
      'maxColumns': 5,
      'preserveWindows': true
    },

    //true or false.  controls display of "Add new object from URL" on manifest listing page
    'showAddFromURLBox' : true,

    'repoImages' : {
      'Yale University': 'yale_logo.jpeg',
      'Stanford University': 'sul_logo.jpeg',
      'Harvard University': 'harvard_logo.png',
      'e-codices': 'e-codices_logo.png',
      'BnF': 'bnf_logo.jpeg',
      'National Library of Wales': 'llgc_logo.jpeg',
      'other': 'iiif_logo.png'
    },

    /**
     *  Annotation backend that have instance-specific configuration data as a hash, e.g.:
     *  {
     *  name: 'backend name',
     *  module: 'NameEndpoint',
     *  options:
     *  { 'url': '',
     *    'storeId': 123,
     *    'APIKey': '23983hf98j3f9283jf2983fj'
     *  }
     *  }
     **/
    'annotationEndpoint': {},

    'sharingEndpoint': {
      'url': '',
      'storeId': 123,
      'APIKey': '23983hf98j3f9283jf2983fj'
    },

    // linked image views configuration
    'lockController' : {
      'lockProfile' : 'lazyZoom',
      'notifyMaxMin' : true
    }
  };

}(Mirador));

(function($) {

  $.Viewer = function(options) {

    jQuery.extend(true, this, {
      id:                     options.id,
      hash:                   options.id,
      data:                   null,
      element:                null,
      canvas:                 null,
      workspaceType:          null,
      layout:                 null,
      workspace:              null,
      mainMenu:               null,
      workspaceAutoSave:      null,
      windowSize:             {},
      resizeRatio:            {},
      currentWorkspaceVisible: true,
      overlayStates:          {
        'workspacePanelVisible': false,
        'manifestsPanelVisible': false,
        'optionsPanelVisible': false,
        'bookmarkPanelVisible': false
      },
      manifests:             []
    }, $.DEFAULT_SETTINGS, options);

    // get initial manifests
    this.element = this.element || jQuery('#' + this.id);

    if (this.data) {
      this.init();
    }
  };

  $.Viewer.prototype = {

    init: function() {
      var _this = this;
      // retrieve manifests
      this.getManifestsData();

      //check all buttons in mainMenu.  If they are all set to false, then don't show mainMenu
      var showMainMenu = false;
      jQuery.each(this.mainMenuSettings.buttons, function(key, value) {
        if (value) { showMainMenu = true; }
      });
      //even if buttons are available, developer can override and set show to false
      if (this.mainMenuSettings.show === false) {
        showMainMenu = false;
      }

      // add main menu
      if (showMainMenu) {
        this.mainMenu = new $.MainMenu({ parent: this, appendTo: this.element });
      }

      // add viewer area
      this.canvas = jQuery('<div/>')
      .addClass('mirador-viewer')
      .appendTo(this.element);

      if (!showMainMenu) {
        this.canvas.css("top", "0px");
      }

      // add workspace configuration
      this.layout = typeof this.layout !== 'string' ? JSON.stringify(this.layout) : this.layout;
      this.workspace = new $.Workspace({
        layoutDescription: this.layout.charAt(0) === '{' ? JSON.parse(this.layout) : $.layoutDescriptionFromGridString(this.layout),
        parent: this,
        appendTo: this.element.find('.mirador-viewer')
      });

      this.workspacePanel = new $.WorkspacePanel({
        appendTo: this.element.find('.mirador-viewer'),
        parent: this,
        maxRows: this.workspacePanelSettings.maxRows,
        maxColumns: this.workspacePanelSettings.maxColumns,
        preserveWindows: this.workspacePanelSettings.preserveWindows,
        workspace: this.workspace
      });

      this.manifestsPanel = new $.ManifestsPanel({ parent: this, appendTo: this.element.find('.mirador-viewer') });

      this.bookmarkPanel = new $.BookmarkPanel({ parent: this, appendTo: this.element.find('.mirador-viewer') });


      // set this to be displayed
      this.set('currentWorkspaceVisible', true);

      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;
      // check that windows are loading first to set state of slot?
      jQuery.subscribe('manifestReceived', function(event, newManifest) {
        if (_this.windowObjects) {
          var check = jQuery.grep(_this.windowObjects, function(object, index) {
            return object.loadedManifest === newManifest.uri;
          });
          jQuery.each(check, function(index, config) {
            _this.loadManifestFromConfig(config);
          });
        }
      });

    },

    get: function(prop, parent) {
      if (parent) {
        return this[parent][prop];
      }
      return this[prop];
    },

    set: function(prop, value, options) {
      var _this = this;
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
      jQuery.publish(prop + '.set', value);
    },

    // Sets state of overlays that layer over the UI state
    toggleOverlay: function(state) {
      var _this = this;
      // first confirm all others are off
      jQuery.each(this.overlayStates, function(oState, value) {
        if (state !== oState) {
          _this.set(oState, false, {parent: 'overlayStates'});
        }
      });
      var currentState = this.get(state, 'overlayStates');
      this.set(state, !currentState, {parent: 'overlayStates'});
    },

    toggleLoadWindow: function() {
      this.toggleOverlay('manifestsPanelVisible');
    },

    toggleWorkspacePanel: function() {
      this.toggleOverlay('workspacePanelVisible');
    },

    toggleBookmarkPanel: function() {
      this.toggleOverlay('bookmarkPanelVisible');
    },

    getManifestsData: function() {
      var _this = this;

      _this.data.forEach(function(manifest) {
        if (manifest.hasOwnProperty('manifestUri')) {
          var url = manifest.manifestUri;
          _this.addManifestFromUrl(url, manifest.location ? manifest.location : '');
        } else if (manifest.hasOwnProperty('collectionUri')) {
          jQuery.getJSON(manifest.collectionUri).done(function (data, status, jqXHR) {
            if (data.hasOwnProperty('manifests')){
              jQuery.each(data.manifests, function (ci, mfst) {
                _this.addManifestFromUrl(mfst['@id'], '');
              });
            }
          }).fail(function(jqXHR, status, error) {
            console.log(jqXHR, status, error);
          });
        }
      });
    },

    hasWidgets: function(collection) {
      return (
        typeof collection.widgets !== 'undefined' &&
        collection.widgets &&
        !jQuery.isEmptyObject(collection.widgets) &&
        collection.widgets.length > 0
      );
    },

    addManifestFromUrl: function(url, location) {
      var _this = this,
      manifest;

      if (!_this.manifests[url]) {
        manifest = new $.Manifest(url, location);
        _this.manifests[url] = manifest;
        _this.manifests.push(manifest);
        jQuery.publish('manifestQueued', manifest);
        manifest.request.done(function() {
          jQuery.publish('manifestReceived', manifest);
        });
      }
    },

    loadManifestFromConfig: function(options) {
      // check if there are available slots, otherwise don't process this object from config
      var slotAddress = options.slotAddress ? options.slotAddress : this.workspace.getAvailableSlot().layoutAddress;
      var windowConfig = {
        manifest: this.manifests[options.loadedManifest],
        currentFocus : options.viewType,
        focuses : options.availableViews,
        currentCanvasID : options.canvasID,
        id : options.id,
        focusOptions : options.windowOptions,
        bottomPanelAvailable : options.bottomPanel,
        sidePanelAvailable : options.sidePanel,
        overlayAvailable : options.overlay,
        annotationLayerAvailable : options.annotationLayer,
        slotAddress: slotAddress,
        displayLayout : options.displayLayout,
        layoutOptions: options.layoutOptions
      };

      this.workspace.addWindow(windowConfig);
    }
  };

}(Mirador));

(function($) {

  $.Workspace = function(options) {

    jQuery.extend(true, this, {
      workspaceSlotCls: 'slot',
      focusedSlot:      null,
      slots:            [],
      windows:          [],
      appendTo:         null,
      parent:           null,
      layoutDescription:    null
    }, options);

    this.element  = this.element || jQuery('<div class="workspace-container" id="workspace">');
    this.init();

  };

  $.Workspace.prototype = {
    init: function () {
      this.element.appendTo(this.appendTo);
      if (this.type === "none") {
        this.parent.toggleSwitchWorkspace();
        return;
      }

      this.calculateLayout();

      this.bindEvents();
    },

    get: function(prop, parent) {
      if (parent) {
        return this[parent][prop];
      }
      return this[prop];
    },

    set: function(prop, value, options) {
      var _this = this;
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
      jQuery.publish(prop + '.set', value);
    },

    calculateLayout: function(resetting) {
      var _this = this,
      layout;

      _this.layout = layout = new Isfahan({
        containerId: _this.element.attr('id'),
        layoutDescription: _this.layoutDescription,
        configuration: null,
        padding: 3
      });

      var data = layout.filter( function(d) {
        return !d.children;
      });

      // Data Join.
      var divs = d3.select("#" + _this.element.attr('id')).selectAll(".layout-slot")
      .data(data, function(d) { return d.id; });

      // Implicitly updates the existing elements.
      // Must come before the enter function.
      divs.call(cell).each(function(d) {
        _this.slots.forEach(function(slot) {
          if (slot.slotID === d.id) {
            slot.layoutAddress = d.address;
          }
        });
      });

      // Enter
      divs.enter().append("div")
      .attr("class", "layout-slot")
      .attr("data-layout-slot-id", function(d) { return d.id; })
      .call(cell)
      .each(function(d) {
        var appendTo = _this.element.children('div').filter('[data-layout-slot-id="'+ d.id+'"]')[0];
        _this.slots.push(new $.Slot({
          slotID: d.id,
          layoutAddress: d.address,
          focused: true,
          parent: _this,
          appendTo: appendTo
        }));
      });

      // Exit
      divs.exit()
      .remove("div")
      .each(function(d) {
        var slotMap = _this.slots.reduce(function(map, temp_slot) {
          if (d.id === temp_slot.slotID) {
            map[d.id] = temp_slot;
          }
          return map;
        }, {}),
        slot = slotMap[d.id];

        if (slot && slot.window && !resetting) {
          jQuery.publish("windowRemoved", slot.window.id);
        }

        _this.slots.splice(_this.slots.indexOf(slot), 1);
      });

      function cell() {
        this
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx ) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy ) + "px"; });
      }

      var root = jQuery.grep(_this.layout, function(node) { return !node.parent;})[0];
      jQuery.publish("layoutChanged", root);
    },

    split: function(targetSlot, direction) {
      var _this = this,
      node = jQuery.grep(_this.layout, function(node) { return node.id === targetSlot.slotID; })[0];
      nodeIndex = node.parent ? node.parent.children.indexOf(node) : 0,
      nodeIsNotRoot = node.parent;

      function addSibling(node, indexDifference) {
        if (nodeIsNotRoot) {
          var siblingIndex = nodeIndex + indexDifference,
          newSibling = _this.newNode(node.type, node);

          node.parent.children.splice(siblingIndex, 0, newSibling);
          _this.layout.push(newSibling);
          return newSibling;
        }

        // handles the case where the root needs to be mutated.
        node.type = node.type === 'row' ? 'column' : 'row';
        mutateAndAdd(node, indexDifference);
      }

      function mutateAndAdd(node, indexDifference) {
        // Locally mutate the tree to accomodate a
        // sibling of another kind, transforming
        // both the target node and its parent.
        var newParent = _this.newNode(node.type, node.parent);

        // Flip its type while keeping
        // the same id.
        node.type = node.type === 'row' ? 'column' : 'row';

        // Create a new node (which will be childless)
        // that is also a sibling of this node.
        newSibling = _this.newNode(node.type, newParent);

        // maintain array ordering.
        newParent.children = [];
        newParent.children.push(node); // order matters, place node first.
        newParent.children.splice(indexDifference, 0, newSibling); // order matters, so put new sibling on one side or the other.
        if (nodeIsNotRoot) {
          newParent.parent = node.parent;
          // replace the old node in its parent's child
          // array with the new parent.
          newParent.parent.children[nodeIndex] = newParent;
        }

        node.parent = newParent;
        _this.layout.push(newParent, newSibling);
      }

      if (node.type === 'column') {
        // Since it is a column:
        //
        // If adding to a side, simply
        // add a sibling.
        // Left means before, right means after.
        if (direction === 'r' || direction === 'l') {
          indexDifference = direction === 'r' ? 1 : 0;
          addSibling(node, indexDifference);
        }
        // If adding above or below, the
        // operation must be changed to mutating
        // the structure.
        // Up means before, Down means after.
        else {
          indexDifference = direction === 'd' ? 1 : 0;
          mutateAndAdd(node, indexDifference);
        }
      } else {
        // Since it is a row:
        //
        // If adding to a side, mutate the
        // structure.
        // Left means before, right means after.
        if (direction === 'r' || direction === 'l') {
          indexDifference = direction === 'r' ? 1 : 0;
          mutateAndAdd(node, indexDifference);
        }
        // If adding above or below, the
        // operations must be switched to adding
        // a sibling.
        // Up means before, Down means after.
        else {
          indexDifference = direction === 'd' ? 1 : 0;
          addSibling(node, indexDifference);
        }
      }

      // Recalculate the layout.
      // The original hierarchical structure is
      // accessible from the root node. Passing
      // it back through the layout code will
      // recalculate everything else needed for
      // the redraw.
      var root = jQuery.grep(_this.layout, function(node) { return !node.parent;})[0];
      _this.layoutDescription = root;
      _this.calculateLayout();

    },

    splitRight: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'r');
    },

    splitLeft: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'l');
    },

    splitUp: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'u');
    },

    splitDown: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'd');
    },

    removeNode: function(targetSlot) {
      // de-mutate the tree structure.
      var _this = this,
      node = jQuery.grep(_this.layout, function(node) { return node.id === targetSlot.slotID; })[0],
      nodeIndex = node.parent.children.indexOf(node),
      parentIndex,
      remainingNode,
      root = jQuery.grep(_this.layout, function(node) { return !node.parent;})[0];

      if (node.parent.children.length === 2) {
        // de-mutate the tree without destroying
        // the children of the remaining node,
        // which in this case means changing their
        // IDs.
        node.parent.children.splice(nodeIndex,1);
        remainingNode = node.parent.children[0];

        remainingNode.parent.id = remainingNode.id;
        delete node.parent;
      } else if (node.parent.children.length === 1) {
      } else {
        // If the node is one of more than 2 siblings,
        // simply splice it out of the parent's children
        // array.
        node.parent.children.splice(nodeIndex, 1);
      }

      _this.layoutDescription = root;
      _this.calculateLayout();
    },

    newNode: function(type, parent) {
      if (typeof parent === 'undefined') {
        return {
          type: type,
          id: $.genUUID()
        };
      } else {
        return {
          type: type,
          id: $.genUUID(),
          parent: parent
        };
      }
    },

    getSlotFromAddress: function(address) {
      var _this = this;
      return _this.slots.filter(function(slot) {
        return slot.layoutAddress === address;
      })[0];
    },

    resetLayout: function(layoutDescription) {
      this.layoutDescription = layoutDescription;
      this.calculateLayout(true);
      this.placeWindows();
    },

    placeWindows: function() {
      // take the windows array and place
      // as many windows into places as can
      // fit.
      var _this = this,
      deletedWindows;

      if (_this.windows.length > _this.slots.length) {
        // splice modifies the original array and
        // returns the deleted items,
        // so we can just perform a forEach on the
        // return value, and have the saveController
        // remove these windows in response to the event
        // (which otherwise it would not do).
        //
        // The event was not called in the calculateLayout
        // function because we need the other windows to remain,
        // so we filter them here.
        _this.windows.splice(0, _this.windows.length -_this.slots.length).forEach(function(removedWindow){
          jQuery.publish('windowRemoved', removedWindow.id);
        });
      }

      _this.windows.forEach(function(window) {
        var slot = _this.getAvailableSlot();
        slot.window = window;

        window.update({
          id: window.id,
          slotAddress: slot.layoutAddress,
          parent: slot,
          appendTo: slot.element,
          currentCanvasID: window.currentCanvasID,
          currentFOcus: window.currentFocus
        });
      });
    },

    getAvailableSlot: function() {
      return this.slots.filter(function(slot) {
        return !slot.window;
      })[0];
    },

    bindEvents: function() {
      var _this = this;

      d3.select(window).on('resize', function(event) {
        _this.calculateLayout();
      });

      jQuery.subscribe('manifestQueued', function(event, manifestPromise) {
        // Trawl windowObjects preemptively for slotAddresses and
        // notify those slots to display a "loading" state.
        // Similar to the operation of the manifestLoadStatusIndicator
        // and its associated manifestList controller.
        var targetSlot;

        if (_this.parent.windowObjects) {
          var check = _this.parent.windowObjects.forEach(function(windowConfig, index) {
            // windowConfig.slotAddress will give the slot;
            // change the state on that slot to be "loading"
            if (windowConfig.slotAddress) {
              targetSlot = _this.getSlotFromAddress(windowConfig.slotAddress);
            } else {
              targetSlot = _this.focusedSlot || _this.slots.filter(function(slot) {
                return slot.hasOwnProperty('window') ? true : false;
              })[0];
            }
          });
        }
      });

      jQuery.subscribe('windowRemoved', function(windowId) {
        var remove = _this.windows.map(function(window) {
          return window.id !== windowId;
        })[0],
        spliceIndex = _this.windows.indexOf(remove);
        _this.windows.splice(spliceIndex, 0);
      });
    },

    clearSlot: function(slotId) {
      if (this.slots[slodId].windowElement) {
        this.slots[slotId].windowElement.remove();
      }
      this.slots[slotId].window = null;
    },

    addItem: function(slot) {
      this.focusedSlot = slot;
      this.parent.toggleLoadWindow();
    },

    addWindow: function(windowConfig) {
      // Windows can be added from a config,
      // from a saved state, (in both those cases they are in the form of "windowObjects")
      // from the workspace windows list after a grid layout change,
      // from the manifests panel in image mode,
      // or from the manifests panel in thumbnail mode.
      var _this = this,
      newWindow;

      jQuery.each(_this.parent.overlayStates, function(oState, value) {
        // toggles the other top-level panels closed and focuses the
        // workspace. For instance, after selecting an object from the
        // manifestPanel.
        _this.parent.set(oState, false, {parent: 'overlayStates'});
      });

      if (windowConfig.slotAddress) {
        targetSlot = _this.getSlotFromAddress(windowConfig.slotAddress);
      } else {
        targetSlot = _this.focusedSlot || _this.getAvailableSlot();
      }

      windowConfig.appendTo = targetSlot.element;
      windowConfig.parent = targetSlot;

      if (!targetSlot.window) {
        windowConfig.slotAddress = targetSlot.layoutAddress;
        windowConfig.id = windowConfig.id || $.genUUID();

        jQuery.publish("windowAdded", {id: windowConfig.id, slotAddress: windowConfig.slotAddress});

        newWindow = new $.Window(windowConfig);
        _this.windows.push(newWindow);

        targetSlot.window = newWindow;

        // This needs to be called after the window is visible so that the thumbnail position is not 0,0 and therefore can be scrolled
        //
        // Yeah, I think the source of the problem was that the element was being appended later than the canvas update call, which was never received by anything.
        jQuery.publish(('currentCanvasIDUpdated.' + windowConfig.id), windowConfig.currentCanvasID);
      } else {
        targetSlot.window.element.remove();
        targetSlot.window.update(windowConfig);
        jQuery.publish(('currentCanvasIDUpdated.' + windowConfig.id), windowConfig.currentCanvasID);
        // The target slot already has a window in it, so just update that window instead,
        // using the appropriate saving functions, etc. This obviates the need changing the
        // parent, slotAddress, setting a new ID, and so on.
      }
    }
  };
}(Mirador));

(function($) {

  $.BookmarkPanel = function(options) {

    jQuery.extend(true, this, {
      element: null,
      appendTo: null,
      parent: null
    }, options);

    this.init();

  };

  $.BookmarkPanel.prototype = {
    init: function () {
      this.element = jQuery(this.template()).appendTo(this.appendTo);
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;
      // handle subscribed events
      jQuery.subscribe('bookmarkPanelVisible.set', function(_, stateValue) {
        if (stateValue) { _this.show(); return; }
        _this.hide();
      });

      jQuery.subscribe('saveControllerConfigUpdated', function() {
        var ajaxType = 'POST',
        ajaxURL = "https://jsonblob.com/api/jsonBlob";

        jQuery.ajax({
          type: ajaxType,
          url: ajaxURL,
          data: JSON.stringify(Mirador.saveController.currentConfig),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          success: function(data, textStatus, request) {
              var jsonblob = request.getResponseHeader('X-Jsonblob');

              var bookmarkURL = window.location.href.replace(window.location.hash, '') + "?json="+jsonblob;
              _this.element.find('#share-url').val(bookmarkURL).focus().select();
         }
        });
      });
    },

    hide: function() {
      jQuery(this.element).hide({effect: "slide", direction: "up", duration: 300, easing: "swing"});
    },

    show: function() {
      jQuery(this.element).show({effect: "slide", direction: "up", duration: 300, easing: "swing"});
    },

    template: Handlebars.compile([
       '<div id="bookmark-panel">',
         '<h3>Bookmark or Share Your Workspace</h3>',
         '<span>',
         'URL: <input id="share-url" type="text"></input>',
         '<a href="javascript:;" class="mirador-btn mirador-icon-copy" data-clipboard-target="share-url"><i class="fa fa-files-o fa-lg"></i></a>',
         '</span>',
       '</div>'
    ].join(''))
  };

}(Mirador));


(function($) {
  // Keeps track of the control context and switches out
  // keyboard control mappings accordingly.

  $.ControlHarness = function(options) {

    jQuery.extend(true, this, {
      contexts: null,
      activeContext: null
    }, options);

    this.init();
  };

  $.ControlHarness.prototype = {

    init: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;

      // workspace is changed:
      // slot is added/removed:
      // window is opened/closed:
      // different top-level menus are opened (load manifest/choose workspace, etc.):
      // item is selected from manifest menu.
      // item is hovered over with the mouse.
      // deliberately moving "up" "down" "left" and "right" through
      // the command contexts.
    },

    switchActiveContext: function() {

    },

    addContext: function(ctxId) {

    },

    removeContext: function(ctxId) {

    }

  };

}(Mirador));


(function($) {

    $.MainMenu = function(options) {

        jQuery.extend(true, this, {
            parent:                     null, //viewer
            element:                    null,
            mainMenuHeight:             null,
            mainMenuWidth:              null,
            windowOptionsMenu:          null,
            loadWindow:                 null,
            clearLocalStorage:          '',
            viewerCls:                  'mirador-viewer',
            mainMenuBarCls:             'mirador-main-menu-bar',
            mainMenuCls:                'mirador-main-menu',
            windowOptionsMenuCls:       'mirador-window-options-menu',
            clearLocalStorageCls:       'clear-local-storage',
            clearLocalStorageDialogCls: 'mirador-main-menu-clear-local-storage',
            collectionsListingCls:      'mirador-listing-collections'
        }, options);

        this.element  = this.element || jQuery('<div/>');

        this.init();
    };


    $.MainMenu.prototype = {

        init: function() {
            //this.mainMenuHeight = this.parent.mainMenuSettings.height;
            //this.mainMenuWidth = this.parent.mainMenuSettings.width;
            this.element
            .addClass(this.mainMenuBarCls)
            //.height(this.mainMenuHeight)
            //.width(this.mainMenuWidth)
            .appendTo(this.appendTo);

            this.element.append(this.template({
                mainMenuCls: this.mainMenuCls,
                showBookmark : this.parent.mainMenuSettings.buttons.bookmark,
                showLayout : this.parent.mainMenuSettings.buttons.layout,
                showOptions: this.parent.mainMenuSettings.buttons.options
            }));

            this.bindEvents();
        },

        bindEvents: function() {
            var _this = this;
            //change 'change-layout' to mouseover events rather than click?
            this.element.find('.change-layout').on('click', function() {
              _this.parent.toggleWorkspacePanel();
            });
            this.element.find('.bookmark-workspace').on('click', function() { _this.parent.toggleBookmarkPanel();
            });
            // when options are implemented, this will need to do something
            this.element.find('.window-options').on('click', function() { });
        },

        template: Handlebars.compile([
        '<ul class="{{mainMenuCls}}">',
        '{{#if showBookmark}}',
          '<li>',
            '<a href="javascript:;" class="bookmark-workspace" title="Bookmark Workspace">',
              '<span class="icon-bookmark-workspace"></span>Bookmark',
            '</a>',
          '</li>',
        '{{/if}}',
        /*'{{#if showOptions}}',
          '<li>',
            '<a href="javascript:;" class="window-options" title="Window Options">',
              '<span class="icon-window-options"></span>Options',
            '</a>',
          '</li>',
        '{{/if}}',*/
        '{{#if showLayout}}',
          '<li>',
            '<a href="javascript:;" class="change-layout" title="Change Layout">',
              '<span class="icon-window-options"></span>Change Layout',
            '</a>',
          '</li>',
        '{{/if}}',
        '</ul>'
      ].join(''))
    };
}(Mirador));

(function ($) {
  $.ManifestList = function(options) {
    this.appendTo = options.appendTo;
    this.manifests = options.manifests;
    this.init();
  };

  $.ManifestList.prototype = {

    init: function() {
      this.element = jQuery('<div>').addClass('manifest-load-status-indicator').prependTo(this.appendTo);
      this.element.append('<h3 class="loading-status">');
      this.bindEvents();
    },

    render: function() {
      var _this = this;

      var pending = _this.manifests.filter(function(d,i) {
        return d.request.state() === 'pending';
      }),
      rejected = _this.manifests.filter(function(d,i) {
        return d.request.state() === 'rejected';
      }),
      resolved = _this.manifests.filter(function(d,i) {
        return d.request.state() === 'resolved';
      });

      // pending, failed, or complete
      var requests = d3.select(_this.element[0])
      .selectAll('div.pending')
      .data(pending);

      // add new requests to the queue.
      requests.enter()
      .insert('div', ':nth-child(2)')
      .classed('request-status-bar', true)
      .classed('pending', true)
      .style('left', '3000px')
      .transition()
      .duration(300)
      .style('left', '0');

      requests.exit()
      .classed('pending', false)
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove();

      d3.select(_this.element.find('h3')[0])
      .text(function() {
        var count = pending.length;
        return "Loading " + count + " Items...";
      });
    },

    bindEvents: function() {
      var _this = this;
      jQuery.subscribe('manifestQueued', function(manifest) {
        _this.render();
      });
      jQuery.subscribe('manifestReceived', function(manifest) {
        _this.render();
      });
    },

    hide: function() {
      var _this = this;
      jQuery(this.element).hide({effect: "fade", duration: 160, easing: "easeOutCubic"});
    },

    show: function() {
      var _this = this;
      jQuery(this.element).show({effect: "fade", duration: 160, easing: "easeInCubic"});
    }
  };

})(Mirador);

(function($) {

  $.ManifestListItem = function(options) {

    jQuery.extend(true, this, {
      element:                    null,
      parent:                     null,
      manifest:                   null,
      loadStatus:                 null,
      thumbHeight:                80,
      urlHeight:                  150,
      resultsWidth:               0,  // based on screen width
      maxPreviewImagesWidth:      0,
      repoWidth:                  80,
      metadataWidth:              200,
      margin:                     15,
      remainingItemsMinWidth:     80, // set a minimum width for the "more" image
      imagesTotalWidth:           0,
      tplData:                    null
    }, options);

    this.init();

  };

  $.ManifestListItem.prototype = {

    init: function() {
      var _this = this;
      //need a better way of calculating this because JS can't get width and margin of hidden elements, so must manually set that info
      //ultimately use 95% of space available, since sometimes it still displays too many images
      this.maxPreviewImagesWidth = this.resultsWidth - (this.repoWidth + this.margin + this.metadataWidth + this.margin + this.remainingItemsMinWidth);
      this.maxPreviewImagesWidth = this.maxPreviewImagesWidth * 0.95;

      this.fetchTplData(this.manifestId);
      this.element = jQuery(this.template(this.tplData)).prependTo(this.parent.manifestListElement).hide().fadeIn('slow');

      var remainingOffset = this.repoWidth + this.margin + this.metadataWidth + this.margin + this.imagesTotalWidth;
      this.element.find('.remaining-items').css('left', remainingOffset);

      this.bindEvents();
    },

    fetchTplData: function() {
      var _this = this,
      location = _this.manifest.location,
      manifest = _this.manifest.jsonLd;

      this.tplData = {
        label: manifest.label,
        repository: location,
        canvasCount: manifest.sequences[0].canvases.length,
        images: []
      };

      this.tplData.repoImage = (function() {
        var repo = _this.tplData.repository;
        if (_this.tplData.repository === '(Added from URL)') {
          repo = '';
        }
        var imageName = $.DEFAULT_SETTINGS.repoImages[repo || 'other'];

        return 'images/logos/' + imageName;
      })();

      for ( var i=0; i < manifest.sequences[0].canvases.length; i++) {
        var canvas = manifest.sequences[0].canvases[i];
        if (canvas.width === 0) {
          continue;
        }

        var aspectRatio = canvas.height/canvas.width,
        width = (_this.thumbHeight/aspectRatio);
        url = _this.manifest.getThumbnailForCanvas(canvas, width);

        _this.imagesTotalWidth += (width + _this.margin);
        if (_this.imagesTotalWidth >= _this.maxPreviewImagesWidth) {
          _this.imagesTotalWidth -= (width + _this.margin);
          break;
        }

        this.tplData.images.push({
          url: url,
          width: width,
          height: _this.thumbHeight,
          id: canvas['@id']
        });
      }

      this.tplData.remaining = (function() {
        var remaining = manifest.sequences[0].canvases.length - _this.tplData.images.length;
        if (remaining > 0) {
          return remaining;
        }
      })();

    },

    render: function() {

    },

    bindEvents: function() {
      var _this = this;

      this.element.find('img').on('load', function() {
        //if img width is not equal to the width in the html, change height
        jQuery(this).hide().fadeIn(600);
      });

      this.element.on('click', function() {
        var windowConfig = {
          manifest: _this.manifest,
          currentCanvasID: null,
          currentFocus: 'ThumbnailsView'
        };
        $.viewer.workspace.addWindow(windowConfig);
      });

      this.element.find('.preview-image').on('click', function(e) {
        e.stopPropagation();
        var windowConfig = {
          manifest: _this.manifest,
          currentCanvasID: jQuery(this).attr('data-image-id'),
          currentFocus: 'ImageView'
        };
        $.viewer.workspace.addWindow(windowConfig);
      });

      jQuery.subscribe('manifestPanelWidthChanged', function(event, newWidth){
        var newMaxPreviewWidth = newWidth - (_this.repoWidth + _this.margin + _this.metadataWidth + _this.margin + _this.remainingItemsMinWidth);
        newMaxPreviewWidth = newMaxPreviewWidth * 0.95;
        if (newMaxPreviewWidth < _this.maxPreviewImagesWidth ) {
          while (_this.imagesTotalWidth >= newMaxPreviewWidth) {
            image = _this.tplData.images.pop();
            _this.imagesTotalWidth -= (image.width + _this.margin);

            //remove image from dom
            _this.element.find('img[data-image-id="'+image.id+'"]').remove();
            var remainingOffset = _this.repoWidth + _this.margin + _this.metadataWidth + _this.margin + _this.imagesTotalWidth;

            //increase remaining # by 1
            var remaining = _this.element.find('.remaining-amount');
            var newRemaining;
            if (remaining.length > 0) {
              newRemaining = parseInt(remaining[0].innerHTML, 10) + 1;
              remaining[0].innerHTML = newRemaining;
            } else {
              //add the remaining element
              newRemaining = 1;
              _this.element.find('.preview-images').after('<div class="remaining-items"><h3><span class="remaining-amount">'+newRemaining+'</span> more</h3></div>');
            }

            //update size of "More" icon
            _this.element.find('.remaining-items').css('left', remainingOffset);
          }
        }
        _this.maxPreviewImagesWidth = newMaxPreviewWidth;
      });
    },

    hide: function() {
      var _this = this;
    },

    show: function() {
      var _this = this;
    },

    template: Handlebars.compile([
                                 '<li>',
                                 '<div class="repo-image">',
                                 '<img src="/themes/de_theme/img/logo_red.png" alt="repoImg">',
                                 '</div>',
                                 '<div class="select-metadata">',
                                 '<h3 class="manifest-title">{{label}}</h3>',
                                 '<h4>{{canvasCount}} items</h4>',
                                 '{{#if repository}}',
                                 '<h4 class="repository-label">{{repository}}</h4>',
                                 '{{/if}}',
                                 '</div>',
                                 '<div class="preview-images">',
                                 '{{#each images}}',
                                 '<img src="{{url}}" width="{{width}}" height="{{height}}" class="preview-image flash" data-image-id="{{id}}">',
                                 '{{/each}}',
                                 '</div>',
                                 '{{#if remaining}}',
                                 '<div class="remaining-items"><h3><span class="remaining-amount">{{remaining}}</span> more</h3></div>',
                                 '{{/if}}',
                                 '</li>'
    ].join(''))
  };

}(Mirador));


(function ($) {
  $.ManifestLoadStatusIndicator = function(options) {

    this.appendTo = options.appendTo;
    this.manifests = options.manifests;
    this.init();
  };

  $.ManifestLoadStatusIndicator.prototype = {

    init: function() {
      this.element = jQuery('<div>').addClass('manifest-load-status-indicator').prependTo(this.appendTo);
      this.element.append('<h3 class="loading-status">');
      this.bindEvents();
    },

    render: function() {
      var _this = this;

      //console.log(_this.manifests.length);
      var pending = _this.manifests.filter(function(d,i) {
        return d.request.state() === 'pending';
      }),
      rejected = _this.manifests.filter(function(d,i) {
        return d.request.state() === 'rejected';
      }),
      resolved = _this.manifests.filter(function(d,i) {
        return d.request.state() === 'resolved';
      });

      // pending, failed, or complete
      var requests = d3.select(_this.element[0])
      .selectAll('div.pending')
      .data(pending);

      //console.log(pending);

      // add new requests to the queue.
      requests.enter()
      .insert('div', ':nth-child(2)')
      .classed('request-status-bar', true)
      .classed('pending', true)
      .style('left', '3000px')
      .transition()
      .duration(300)
      .style('left', '0');

      requests.exit()
      .classed('pending', false)
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove();

      d3.select(_this.element.find('h3')[0])
      .text(function() {
        var count = pending.length;
        return "Loading " + count + " Items...";
      });
    },

    bindEvents: function() {
      var _this = this;
      jQuery.subscribe('manifestQueued', function(manifest) {
        //console.log('queued');
        _this.render();
      });
      jQuery.subscribe('manifestReceived', function(manifest) {
        //console.log('received');
        _this.render();
      });
    },


    hide: function() {
      var _this = this;
      jQuery(this.element).hide({effect: "fade", duration: 160, easing: "easeOutCubic"});
    },

    show: function() {
      var _this = this;
      jQuery(this.element).show({effect: "fade", duration: 160, easing: "easeInCubic"});
    }
  };

})(Mirador);

(function($) {

    $.ManifestsPanel = function(options) {

        jQuery.extend(true, this, {
            element:                    null,
            listItems:                  null,
            appendTo:                   null,
            parent:                     null,
            manifestListItems:          [],
            manifestListElement:        null,
            manifestLoadStatusIndicator: null,
            resultsWidth:               0
        }, options);

        var _this = this;
        _this.init();

    };

    $.ManifestsPanel.prototype = {

        init: function() {
            this.element = jQuery(this.template({
                showURLBox : this.parent.showAddFromURLBox
            })).appendTo(this.appendTo);
            this.manifestListElement = this.element.find('ul');

            //this code gives us the max width of the results area, used to determine how many preview images to show
            //cloning the element and adjusting the display and visibility means it won't break the normal flow
            var clone = this.element.clone().css("visibility","hidden").css("display", "block").appendTo(this.appendTo);
            this.resultsWidth = clone.find('.select-results').outerWidth();
            clone.remove();

            // this.manifestLoadStatusIndicator = new $.ManifestLoadStatusIndicator({
            //   manifests: this.parent.manifests,
            //   appendTo: this.element.find('.select-results')
            // });
            this.bindEvents();
        },

        bindEvents: function() {
            var _this = this;
            // handle interface events
            this.element.find('form#url-load-form').on('submit', function(event) {
                event.preventDefault();
                var url = jQuery(this).find('input').val();
                _this.parent.addManifestFromUrl(url, "(Added from URL)");
                //console.log('trying to add from URL');
            });

            this.element.find('.remove-object-option').on('click', function() {
              _this.parent.toggleLoadWindow();
            });

            // handle subscribed events
            jQuery.subscribe('manifestsPanelVisible.set', function(_, stateValue) {
               if (stateValue) { _this.show(); return; }
                _this.hide();
            });

            jQuery.subscribe('manifestReceived', function(event, newManifest, repository) {
              //console.log(newManifest);
              _this.manifestListItems.push(new $.ManifestListItem({ parent: _this, manifest: newManifest, resultsWidth: _this.resultsWidth }));
              _this.element.find('#manifest-search').keyup();
            });

            // Filter manifests based on user input
            this.element.find('#manifest-search').on('keyup input', function() {
               if (this.value.length > 0) {
                  _this.element.find('.items-listing li').show().filter(function() {
                     return jQuery(this).text().toLowerCase().indexOf(_this.element.find('#manifest-search').val().toLowerCase()) === -1;
                  }).hide();
               } else {
                  _this.element.find('.items-listing li').show();
               }
            });

            this.element.find('#manifest-search-form').on('submit', function(event) {
              event.preventDefault();
            });

            jQuery.subscribe('resize', $.debounce(function(){
              var clone = _this.element.clone().css("visibility","hidden").css("display", "block").appendTo(_this.appendTo);
              _this.resultsWidth = clone.find('.select-results').outerWidth();
              clone.remove();
              jQuery.publish("manifestPanelWidthChanged", _this.resultsWidth);
            }, 100));
        },

        hide: function() {
            var _this = this;
            jQuery(this.element).hide({effect: "fade", duration: 160, easing: "easeOutCubic"});
        },

        show: function() {
            var _this = this;

            jQuery(this.element).show({effect: "fade", duration: 160, easing: "easeInCubic"});
        },

        template: Handlebars.compile([
          '<div id="manifest-select-menu">',
          '<div class="container">',
              '<div id="load-controls">',
              '<a class="remove-object-option"><i class="fa fa-times fa-lg fa-fw"></i> Close</a>',
              '<form action="" id="manifest-search-form">',
                  '<label for="manifest-search">Filter objects:</label>',
                  '<input id="manifest-search" type="text" name="manifest-filter" placeholder="Filter objects...">',
              '</form>',
              '{{#if showURLBox}}',
              '<br/>',
              '<form action="" id="url-load-form">',
                  '<label for="url-loader">Add new object from URL:</label>',
                  '<input type="text" id="url-loader" name="url-load" placeholder="http://...">',
              '</form>',
              '{{/if}}',
              '</div>',
              '<div class="select-results">',
                  '<ul class="items-listing">',
                  '</ul>',
              '</div>',
              '</div>',
          '</div>'
        ].join(''))
    };

}(Mirador));


(function($) {

  $.WorkspacePanel = function(options) {

    jQuery.extend(true, this, {
      element: null,
      appendTo: null,
      parent: null,
      workspace: null,
      maxRows: null,
      maxColumns: null
    }, options);

    this.init();

  };

  $.WorkspacePanel.prototype = {
    init: function () {
      var _this = this,
      templateData = {
        rows: $.layoutDescriptionFromGridString(_this.maxColumns + 'x' + _this.maxRows).children.map(function(column, rowIndex) {
          column.columns = column.children.map(function(row, columnIndex) {
            row.gridString = (rowIndex+1) + 'x' + (columnIndex+1);
            return row;
          });
          return column;
        })
      };

      this.element = jQuery(this.template(templateData)).appendTo(this.appendTo);
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;
      jQuery.subscribe('workspacePanelVisible.set', function(_, stateValue) {
        if (stateValue) { _this.show(); return; }
        _this.hide();
      });

      _this.element.find('.grid-item').on('click', function() {
        var gridString = jQuery(this).data('gridstring');
        _this.onSelect(gridString);
      });

      _this.element.find('.grid-item').on('mouseover', function() {
        var gridString = jQuery(this).data('gridstring');
        _this.onHover(gridString);
      });

      _this.element.find('.select-grid').on('mouseout', function() {
        _this.element.find('.grid-item').removeClass('hovered');
        _this.element.find('.grid-instructions').show();
        _this.element.find('.grid-text').hide();
      });
    },

    onSelect: function(gridString) {
      var _this = this;
      var layoutDescription = $.layoutDescriptionFromGridString(gridString);
      _this.workspace.resetLayout(layoutDescription);
      _this.parent.toggleWorkspacePanel();
    },

    onHover: function(gridString) {
      var _this = this,
      highestRow = gridString.charAt(0),
      highestColumn = gridString.charAt(2),
      gridItems = _this.element.find('.grid-item');
      gridItems.removeClass('hovered');
      gridItems.filter(function(index) {
        var element = jQuery(this);
        var change = element.data('gridstring').charAt(0) <= highestRow && element.data('gridstring').charAt(2)<=highestColumn;
        return change;
      }).addClass('hovered');
      _this.element.find('.grid-instructions').hide();
      _this.element.find('.grid-text').text(gridString).show();
    },

    hide: function() {
      jQuery(this.element).hide({effect: "fade", duration: 160, easing: "easeOutCubic"});
    },

    show: function() {
      jQuery(this.element).show({effect: "fade", duration: 160, easing: "easeInCubic"});
    },

    template: Handlebars.compile([
                                 '<div id="workspace-select-menu">',
                                 '<h1>Change Layout</h1>',
                                 '<h3 class="grid-text"></h3>',
                                 '<h3 class="grid-instructions">Select a grid below</h3>',
                                 '<div class="select-grid">',
                                 '{{#each rows}}',
                                 '<div class="grid-row">',
                                   '{{#each columns}}',
                                   '<a class="grid-item" data-gridString="{{gridString}}">',
                                   '<div class="grid-icon"></div>',
                                   '</a>',
                                   '{{/each}}',
                                 '</div>',
                                 '{{/each}}',
                                 '</div>',
                                 // '<div class="preview-container">',
                                 // '</div>',
                                 '</div>'
    ].join(''))
  };

}(Mirador));


(function($){

  $.Manifest = function(manifestUri, location) {

    jQuery.extend(true, this, {
      jsonLd: null,
      location: location,
      uri: manifestUri,
      request: null
    });

    this.init(manifestUri);
  };

  $.Manifest.prototype = {
    init: function(manifestUri) {
      var _this = this;
      this.request = jQuery.ajax({
        url: manifestUri,
        dataType: 'json',
        async: true
      });

      this.request.done(function(jsonLd) {
        _this.jsonLd = jsonLd;
      });
    },
    getThumbnailForCanvas : function(canvas, width) {
      var version = "1.1",
      service,
      thumbnailUrl;

      // Ensure width is an integer...
      width = parseInt(width, 10);

      // Respecting the Model...
      if (canvas.hasOwnProperty('thumbnail')) {
        // use the thumbnail image, prefer via a service
        if (typeof(canvas.thumbnail) == 'string') {
          thumbnailUrl = canvas.thumbnail;
        } else if (canvas.thumbnail.hasOwnProperty('service')) {
          // Get the IIIF Image API via the @context
          service = canvas.thumbnail.service;
          if (service.hasOwnProperty('@context')) {
            version = $.Iiif.getVersionFromContext(service['@context']);
          }
          thumbnailUrl = $.Iiif.makeUriWithWidth(service['@id'], width, version);
        } else {
          thumbnailUrl = canvas.thumbnail['@id'];
        }
      } else {
        // No thumbnail, use main image
        var resource = canvas.images[0].resource;
        service = resource['default'] ? resource['default'].service : resource.service;
        if (service.hasOwnProperty('@context')) {
          version = $.Iiif.getVersionFromContext(service['@context']);
        }
        thumbnailUrl = $.Iiif.makeUriWithWidth(service['@id'], width, version);
      }
      return thumbnailUrl;
    },
    getCanvases : function() {
      var _this = this;
      return _this.jsonLd.sequences[0].canvases;
    },
    getAnnotationsListUrl: function(canvasId) {
      var _this = this;
      var canvas = jQuery.grep(_this.getCanvases(), function(canvas, index) {
        return canvas['@id'] === canvasId;
      })[0];

      if (canvas && canvas.otherContent) {
        return canvas.otherContent[0]['@id'];
      } else { return false; }
    },
    getStructures: function() {
      var _this = this;
      return _this.jsonLd.structures;
    }
  };

}(Mirador));

(function($) {

  $.AnnotationTooltip = function(options) {

    jQuery.extend(this, {
      element:   null,
      parent:    null,
      annotations: []
    }, options);

    this.init();
  };

  $.AnnotationTooltip.prototype = {

    init: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;
    },

    getEditor: function(annotation) {
      var annoText,
      tags = [],
      _this = this;

        if (jQuery.isArray(annotation.resource)) {
          jQuery.each(annotation.resource, function(index, value) {
            if (value['@type'] === "oa:Tag") {
              tags.push(value.chars);
            } else {
              annoText = value.chars;
            }
          });
        } else {
          annoText = annotation.resource.chars;
        }

      return this.editorTemplate({content : annoText,
      tags : tags.join(" "),
      id : annotation['@id']});
    },

    getViewer: function(annotations) {
      var annoText,
      tags = [],
      _this = this,
      htmlAnnotations = [],
      id;

      jQuery.each(annotations, function(index, annotation) {
        tags = [];
        if (jQuery.isArray(annotation.resource)) {
          jQuery.each(annotation.resource, function(index, value) {
            if (value['@type'] === "oa:Tag") {
              tags.push(value.chars);
            } else {
              annoText = value.chars;
            }
          });
        } else {
          annoText = annotation.resource.chars;
        }
        htmlAnnotations.push({
          annoText : annoText,
          tags : tags,
          id : annotation['@id'],
          //this needs to be fleshed out more based on permissions from the endpoint,
          //for now, just disable edit/delete for manifest annotations
          showEdit : annotation.endpoint === 'manifest' ? false : true,
          showDelete : annotation.endpoint === 'manifest' ? false : true
        });
      });

      var template = this.viewerTemplate({annotations : htmlAnnotations});
      return template;
      //return combination of all of them
    },

    //when this is being used to edit an existing annotation, insert them into the inputs
    editorTemplate: Handlebars.compile([
                                       '<form class="new-annotation-form annotation-tooltip" {{#if id}}data-anno-id="{{id}}"{{/if}}>',
                                       '<textarea class="text-editor" placeholder="Comments…">{{#if content}}{{content}}{{/if}}</textarea>',
                                       '<input class="tags-editor" placeholder="Add tags here…" {{#if tags}}value="{{tags}}"{{/if}}>',
                                       '<div>',
                                       // need to add a delete, if permissions allow
                                       '<div class="button-container">',
                                       '<a href="#cancel" class="cancel"><i class="fa fa-times-circle-o fa-fw"></i>Cancel</a>',
                                       '<a href="#save" class="save"><i class="fa fa-database fa-fw"></i>Save</a>',
                                       '</div>',
                                       '</div>',
                                       '</form>'
    ].join('')),

    viewerTemplate: Handlebars.compile([
                                       '<div class="all-annotations">',
                                       '{{#each annotations}}',
                                       '<div class="annotation-display annotation-tooltip" data-anno-id="{{id}}">',
                                       '<div class="button-container">',
                                         '{{#if showEdit}}<a href="#edit" class="edit"><i class="fa fa-pencil-square-o fa-fw"></i>Edit</a>{{/if}}',
                                         '{{#if showDelete}}<a href="#delete" class="delete"><i class="fa fa-trash-o fa-fw"></i>Delete</a>{{/if}}',
                                       '</div>',
                                       '<div class="text-viewer">',
                                       '<p>{{{annoText}}}</p>',
                                       '</div>',
                                       '<div class="tags-viewer">',
                                       '{{#each tags}}',
                                       '<span class="tag">{{this}}</span>',
                                       '{{/each}}',
                                       '</div>',
                                       '</div>',
                                       '{{/each}}',
                                       '</div>'
    ].join(''))
  };

}(Mirador));

/*
 * All Endpoints need to have at least the following:
 * annotationsList - current list of OA Annotations
 * dfd - Deferred Object
 * init()
 * search(uri)
 * create(oaAnnotation, returnSuccess, returnError)
 * update(oaAnnotation, returnSuccess, returnError)
 * deleteAnnotation(annotationID, returnSuccess, returnError) (delete is a reserved word)
 * TODO:
 * read() //not currently used
 *
 * Optional, if endpoint is not OA compliant:
 * getAnnotationInOA(endpointAnnotation)
 * getAnnotationInEndpoint(oaAnnotation)
 */
(function($){

  $.CatchEndpoint = function(options) {

    jQuery.extend(this, {
      token:     null,
      prefix:    null,
      urls:      null,
      uri:       null,
      dfd:       null,
      annotationsList: [],        //OA list for Mirador use
      annotationsListCatch: null  //internal list for module use
    }, options);

    this.init();
  };

  $.CatchEndpoint.prototype = {
    //Any set up for this endpoint, and triggers a search of the URI passed to object
    init: function() {
      var userid = "test@mirador.org";
      var username = "mirador";
      this.catchOptions = {
          permissions:{
            user: {
              id: userid,
              name: username
            },
            userString: function (user) {
              if (user && user.name)
                return user.name;
              return user;
            },
            userId: function (user) {
              if (user && user.id)
                return user.id;
              return user;
            },
            permissions: {
              'read':   [],
              'update': [userid],
              'delete': [userid],
              'admin':  [userid]
            },
            showViewPermissionsCheckbox: false,
            showEditPermissionsCheckbox: false,
            userAuthorize: function(action, annotation, user) {
              var token, tokens, _i, _len;
              if (annotation.permissions) {
                tokens = annotation.permissions[action] || [];
                if (is_staff){
                  return true;
                }
                if (tokens.length === 0) {
                  return true;
                }
                for (_i = 0, _len = tokens.length; _i < _len; _i++) {
                  token = tokens[_i];

                  if (this.userId(user) === token) {

                    return true;
                  }
                }

                return false;
              } else if (annotation.user) {
                if (user) {
                  return this.userId(user) === this.userId(annotation.user);
                } else {
                  return false;
                }
              }
              return true;
            }
          }
      };
      this.search(this.uri);
    },

    //Search endpoint for all annotations with a given URI
    search: function(uri) {
      var _this = this;
      this.annotationsList = []; //clear out current list
      jQuery.ajax({
        url: this.prefix+"/search",
        type: 'GET',
        dataType: 'json',
        headers: {
          "x-annotator-auth-token": this.token
        },
        data: {
          uri: uri,
          media: "image",
          limit: 10000
        },

        contentType: "application/json; charset=utf-8",
        success: function(data) {
          _this.annotationsListCatch = data.rows;
          jQuery.each(_this.annotationsListCatch, function(index, value) {
            _this.annotationsList.push(_this.getAnnotationInOA(value));
          });
          _this.dfd.resolve(true);
        },
        error: function() {
          console.log("error searching");
        }

      });
    },

    deleteAnnotation: function(annotationID, returnSuccess, returnError) {
          jQuery.ajax({
             url: this.prefix+"/destroy/"+annotationID,
             type: 'DELETE',
             dataType: 'json',
             headers: {
               "x-annotator-auth-token": this.token
             },
             contentType: "application/json; charset=utf-8",
             success: function(data) {
               returnSuccess();
             },
             error: function() {
               returnError();
             }

           });
    },

    update: function(oaAnnotation, returnSuccess, returnError) {
      var annotation = this.getAnnotationInEndpoint(oaAnnotation),
      _this = this,
      annotationID = annotation.id;

      jQuery.ajax({
        url: this.prefix+"/update/"+annotationID,
        type: 'POST',
        dataType: 'json',
        headers: {
          "x-annotator-auth-token": this.token
        },
        data: JSON.stringify(annotation),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          returnSuccess();
        },
        error: function() {
          returnError();
        }
      });
    },

    //takes OA Annotation, gets Endpoint Annotation, and saves
    create: function(oaAnnotation, returnSuccess, returnError) {
      var annotation = this.getAnnotationInEndpoint(oaAnnotation),
      _this = this;

      jQuery.ajax({
        url: this.prefix+"/create",
        type: 'POST',
        dataType: 'json',
        headers: {
          "x-annotator-auth-token": this.token
        },
        data: JSON.stringify(annotation),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          returnSuccess(data);
        },
        error: function() {
          returnError();
        }
      });
    },

    set: function(prop, value, options) {
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
    },

    //Convert Endpoint annotation to OA
    getAnnotationInOA: function(annotation) {
      var id,
      motivation = [],
      resource = [],
      on,
      annotatedBy;
      //convert annotation to OA format

      id = annotation.id;  //need to make URI

      if (annotation.tags.length > 0) {
        motivation.push("oa:tagging");
        jQuery.each(annotation.tags, function(index, value) {
          resource.push({
            "@type":"oa:Tag",
            "chars":value
          });
        });
      }
      if (annotation.parent && annotation.parent !== "0") {
        motivation.push("oa:replying");
        on = annotation.parent;  //need to make URI
      } else {
        motivation.push("oa:commenting");
        on = { "@type" : "oa:SpecificResource",
          "source" : annotation.uri,
          "selector" : {
            "@type" : "oa:FragmentSelector",
            "value" : "xywh="+annotation.rangePosition.x+","+annotation.rangePosition.y+","+annotation.rangePosition.width+","+annotation.rangePosition.height
          },
          "scope": {
            "@context" : "http://www.harvard.edu/catch/oa.json",
            "@type" : "catch:Viewport",
            "value" : "xywh="+annotation.bounds.x+","+annotation.bounds.y+","+annotation.bounds.width+","+annotation.bounds.height
          }
        };
      }
      resource.push( {
        "@type" : "dctypes:Text",
        "format" : "text/html",
        "chars" : annotation.text
      });

      annotatedBy = { "@id" : annotation.user.id,
        "name" : annotation.user.name};

        var oaAnnotation = {
          "@context" : "http://iiif.io/api/presentation/2/context.json",
          "@id" : String(id),
          "@type" : "oa:Annotation",
          "motivation" : motivation,
          "resource" : resource,
          "on" : on,
          "annotatedBy" : annotatedBy,
          "annotatedAt" : annotation.created,
          "serializedAt" : annotation.updated
        };
        return oaAnnotation;
    },

    // Converts OA Annotation to endpoint format
    getAnnotationInEndpoint: function(oaAnnotation) {
      var annotation = {},
      tags = [],
      text;

      if (oaAnnotation["@id"]) {
        annotation.id = oaAnnotation["@id"];
      }

      annotation.media = "image";
      jQuery.each(oaAnnotation.resource, function(index, value) {
        if (value['@type'] === 'oa:Tag') {
          tags.push(value.chars);
        } else if (value['@type'] === 'dctypes:Text') {
          text = value.chars;
        }
      });
      annotation.tags = tags;
      annotation.text = text;

      annotation.uri = oaAnnotation.on.source;
      var region = oaAnnotation.on.selector.value;
      var regionArray = region.split('=')[1].split(',');
      annotation.rangePosition = {"x":regionArray[0], "y":regionArray[1], "width":regionArray[2], "height":regionArray[3]};

      region = oaAnnotation.on.scope.value;
      regionArray = region.split('=')[1].split(',');
      annotation.bounds = {"x":regionArray[0], "y":regionArray[1], "width":regionArray[2], "height":regionArray[3]};

      annotation.updated = new Date().toISOString();
      if (oaAnnotation.annotatedAt) {
        annotation.created = oaAnnotation.annotatedAt;
      } else {
        annotation.created = annotation.updated;
      }
      // this needs to come from LTI annotation.user.id, annotation.user.name
      annotation.user = this.catchOptions.permissions.user;
      annotation.permissions = this.catchOptions.permissions.permissions;
      annotation.archived = false;
      annotation.ranges = [];
      annotation.parent = "0";
      return annotation;
    }
  };

}(Mirador));

(function($) {

  // Takes a list of oa:annotations passed
  // by reference and renders their regions,
  // registering updates.

  $.OsdCanvasRenderer = function(options) {

    jQuery.extend(this, {
      osd:       null,
      osdViewer: null,
      elements:  null,
      list:      null,
      parent:    null,
      annoTooltips: {},
      tooltips:  null,
      overlays:  []
    }, options);
  };

  $.OsdCanvasRenderer.prototype = {
    parseRegion: function(url) {
      var regionString;
      if (typeof url === 'object') {
        regionString = url.selector.value;
      } else {
        regionString = url.split('#')[1];
      }
      var regionArray = regionString.split('=')[1].split(',');
      return regionArray;
    },

    getOsdFrame: function(region) {
      var rectX = region[0],
      rectY = region[1],
      rectW = region[2],
      rectH = region[3];

      return this.osdViewer.viewport.imageToViewportRectangle(rectX,rectY,rectW,rectH);

    },

    render: function() {
      var _this = this;
      _this.hideAll(),
      this.overlays = [];
      this.list.forEach(function(annotation) {
        var region = _this.parseRegion(annotation.on),
        osdOverlay = document.createElement('div');
        osdOverlay.className = 'annotation';
        osdOverlay.id = annotation['@id'];
        _this.osdViewer.addOverlay({
          element: osdOverlay,
          location: _this.getOsdFrame(region)
        });
        _this.overlays.push(jQuery(osdOverlay));
      });

      this.tooltips = jQuery(this.overlays).qtip({
            overwrite : false,
            content: {
             text : ''
             },
             position : {
              target : 'mouse',
              adjust : {
                mouse: false
              },
              container: jQuery(_this.osdViewer.element)
             },
             style : {
              classes : 'qtip-bootstrap'
             },
             show: {
              delay: 20
             },
             hide: {
                fixed: true,
                delay: 50,
                event: 'mouseleave'
             },
             events: {
               show: function(event, api) {
                 var overlays = _this.getOverlaysFromElement(jQuery(event.originalEvent.currentTarget)),
                 annoTooltip = new $.AnnotationTooltip(), //pass permissions
                 annotations = [];

                 jQuery.each(overlays, function(index, overlay) {
                   annotations.push(_this.getAnnoFromRegion(overlay.id)[0]);
                 });
                 api.set({'content.text' : annoTooltip.getViewer(annotations)});
                 },
               visible: function(event, api) {
                 _this.removeAnnotationEvents(event, api);
                 _this.annotationEvents(event, api);
               },
               move: function(event, api) {
                 _this.removeAnnotationEvents(event, api);
                 _this.annotationEvents(event, api);
                 _this.annotationSaveEvent(event, api);
               },
               hidden: function(event, api) {
                 if (jQuery('.qtip:visible').length === 0) {
                  jQuery(_this.osdViewer.canvas).find('.annotation').removeClass('hovered');
                 }
               }
             }
      });

      this.bindEvents();
    },

    getAnnoFromRegion: function(regionId) {
      return this.list.filter(function(annotation) {
        return annotation['@id'] === regionId;
      });
    },

    getOverlaysFromElement: function(element) {
      var _this = this,
      eo = element.offset(),
      el = eo.left,
      et = eo.top,
      er = el + element.outerWidth(),
      eb = et + element.outerHeight();

      var overlays = jQuery(_this.osdViewer.canvas).find('.annotation').map(function() {
        var self = jQuery(this),
        offset = self.offset(),
        l = offset.left,
        t = offset.top,
        r = l + self.outerWidth(),
        b = t + self.outerHeight();

        //check if the current overlay has a corner contained within the element that triggered the mouseenter
        //OR check if element has a corner contained within the overlay
        //so that any overlapping annotations are stacked and displayed
        //this will also find when the overlay and element are the same thing and return it, which is good, we don't have to add it separately
        return (((l >= el && t >= et && l <= er && t <= eb) ||
                (l >= el && b <= eb && l <= er && b >= et) ||
                (r <= er && t >= et && r >= el && t <= eb) ||
                (r <= er && b <= eb && r >= el && b >= et)) ||

                ((el >= l && et >= t && el <= r && et <= b) ||
                (el >= l && eb <= b && el <= r && eb >= t) ||
                (er <= r && et >= t && er >= l && et <= b) ||
                (er <= r && eb <= b && er >= l && eb >= t)
                )) ? this : null;
      });
      jQuery(_this.osdViewer.canvas).find('.annotation.hovered').removeClass('hovered');
      overlays.addClass('hovered');
      return overlays;
    },

    bindEvents: function() {
      var _this = this;

     this.osdViewer.addHandler('zoom', $.debounce(function(){
          _this.checkMousePosition();
        }, 200, true));

      jQuery.subscribe('removeTooltips.' + _this.parent.windowId, function() {
        jQuery(_this.osdViewer.canvas).find('.annotation').qtip('destroy', true);
      });

    },

    checkMousePosition: function() {
      jQuery('.qtip').qtip('hide');
    },

    update: function() {
      this.render();
    },

    hideAll: function() {
      this.osdViewer.clearOverlays();
    },

    getElements: function() {
      this.elements = this.osdViewer.currentOverlays.reduce(function(result, currentOverlay) {
        currentOverlay = jQuery(currentOverlay);
        return result.add(currentOverlay);
      });
      return elements;
    },

    //change content of this tooltip, and disable hiding it, until user clicks save or cancel
    //disable all other qtips until editing this is done
    freezeQtip: function(api, oaAnno, annoTooltip) {
      jQuery.each(this.overlays, function(index, value) {
          var overlayApi = value.qtip('api');
          if (api.id !== overlayApi.id) {
            overlayApi.disable(true);
          }
        });
        api.set({'content.text' : annoTooltip.getEditor(oaAnno),
        'hide.event' : false});
    },

    //reenable all other qtips
    //update content of this qtip to make it a viewer, not editor
    //and reset hide event
    unFreezeQtip: function(api, oaAnno, annoTooltip) {
      jQuery.each(this.overlays, function(index, value) {
           var overlayApi = value.qtip('api');
           if (api.id !== overlayApi.id) {
            overlayApi.disable(false);
           }
          });
      api.set({'content.text' : annoTooltip.getViewer([oaAnno]),
          'hide.event' : 'mouseleave'}).hide();
    },

    removeAnnotationEvents: function(tooltipevent, api) {
      jQuery('.annotation-tooltip a.delete').off("click");
      jQuery('.annotation-tooltip a.edit').off("click");
      jQuery('.annotation-tooltip a.save').off("click");
      jQuery('.annotation-tooltip a.cancel').off("click");
    },

    annotationEvents: function(tooltipevent, api) {
      var _this = this,
      annoTooltip = new $.AnnotationTooltip();
      jQuery('.annotation-tooltip a.delete').on("click", function(event) {
        event.preventDefault();

        if (!window.confirm("Do you want to delete this annotation?")) {
          return false;
        }

        var display = jQuery(this).parents('.annotation-display'),
        id = display.attr('data-anno-id'),
        oaAnno = _this.getAnnoFromRegion(id)[0];
        jQuery.publish('annotationDeleted.'+_this.parent.windowId, [oaAnno]);

        //remove this annotation's overlay from osd
        //should there be some sort of check that it was successfully deleted? or pass when publishing?
        _this.osdViewer.removeOverlay(jQuery(_this.osdViewer.element).find(".annotation#"+id)[0]);

        //hide tooltip so event handlers don't get messed up
        api.hide();
        display.remove(); //remove this annotation display from dom
      });

      jQuery('.annotation-tooltip a.edit').on("click", function(event) {
        event.preventDefault();

        var display = jQuery(this).parents('.annotation-display'),
        id = display.attr('data-anno-id'),
        oaAnno = _this.getAnnoFromRegion(id)[0];

        _this.freezeQtip(api, oaAnno, annoTooltip);
      });
    },

    annotationSaveEvent: function(event, api) {
      var _this = this,
      annoTooltip = new $.AnnotationTooltip();

      jQuery('.annotation-tooltip').on("submit", function(event) {
        event.preventDefault();
        jQuery('.annotation-tooltip a.save').click();
      });

      jQuery('.annotation-tooltip a.save').on("click", function(event) {
        event.preventDefault();

        var display = jQuery(this).parents('.annotation-tooltip'),
        id = display.attr('data-anno-id'),
        oaAnno = _this.getAnnoFromRegion(id)[0];

        //check if new resourceText is empty??
        var tagText = jQuery(this).parents('.new-annotation-form').find('.tags-editor').val(),
        resourceText = jQuery(this).parents('.new-annotation-form').find('.text-editor').val(),
        tags = [];
        tagText = $.trimString(tagText);
        if (tagText) {
            tags = tagText.split(/\s+/);
        }

        var bounds = _this.osdViewer.viewport.getBounds(true);
        var scope = _this.osdViewer.viewport.viewportToImageRectangle(bounds);
        //bounds is giving negative values?
        //update scope?

        var motivation = [],
        resource = [],
        on;

        //remove all tag-related content in annotation
        oaAnno.motivation = jQuery.grep(oaAnno.motivation, function(value) {
            return value !== "oa:tagging";
        });
        oaAnno.resource = jQuery.grep(oaAnno.resource, function(value) {
            return value["@type"] !== "oa:Tag";
        });
        //re-add tagging if we have them
        if (tags.length > 0) {
            oaAnno.motivation.push("oa:tagging");
            jQuery.each(tags, function(index, value) {
                oaAnno.resource.push({
                    "@type":"oa:Tag",
                     "chars":value
                });
            });
        }
        jQuery.each(oaAnno.resource, function(index, value) {
            if (value["@type"] === "dctypes:Text") {
                value.chars = resourceText;
            }
        });
        //save to endpoint
        jQuery.publish('annotationUpdated.'+_this.parent.windowId, [oaAnno]);

        _this.unFreezeQtip(api, oaAnno, annoTooltip);
        });

        jQuery('.annotation-tooltip a.cancel').on("click", function(event) {
          event.preventDefault();
          var display = jQuery(this).parents('.annotation-tooltip'),
          id = display.attr('data-anno-id'),
          oaAnno = _this.getAnnoFromRegion(id)[0];

        _this.unFreezeQtip(api, oaAnno, annoTooltip);
        });

    }
  };
})(Mirador);

(function($) {
  // Takes an openSeadragon canvas and calls
  // provided callbacks at different stages
  // of a rectangle creation event.

  $.OsdRegionRectTool = function(options) {
    jQuery.extend(this, {
      osdRectTool: null,
      osd:         null,
      osdViewer:   null,
      mouseStart:  null,
      rectangle:   null,
      rectClass:   null,
      osdOverlay:  null,
      dragging:    false,
      parent:      null
      }, options);

      this.init();
  };

  $.OsdRegionRectTool.prototype = {

    init: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;
    },

    reset: function(osdViewer) {
      this.dragging = false;
      this.osdOverlay = null;
      this.rectangle = null;
      this.mouseStart = null;
      this.osdViewer = osdViewer;
    },

    enterEditMode: function() {
      var _this = this;
      this.setOsdFrozen(true);
      this.osdViewer.addHandler("canvas-drag", _this.startRectangle, {recttool: _this});
      this.osdViewer.addHandler("canvas-release", _this.finishRectangle, {recttool: _this});
      this.onModeEnter();
    },

    startRectangle: function(event) {
      var _this = this.userData.recttool; //osd userData
      if (!_this.dragging) {
        _this.dragging = true;
        _this.mouseStart = _this.osdViewer.viewport.pointFromPixel(event.position);
        _this.createNewRect(_this.mouseStart);
        _this.onDrawStart();
      } else {
        var mouseNow = _this.osdViewer.viewport.pointFromPixel(event.position);
        _this.updateRectangle(_this.mouseStart, mouseNow);
        _this.onDraw();
      }
    },

    finishRectangle: function(event) {
      var _this = this.userData.recttool; //osd userData
      _this.dragging = false;
      var osdImageRect = _this.osdViewer.viewport.viewportToImageRectangle(_this.rectangle);
      var canvasRect = {
        x: parseInt(osdImageRect.x, 10),
        y: parseInt(osdImageRect.y, 10),
        width: parseInt(osdImageRect.width, 10),
        height: parseInt(osdImageRect.height, 10)
      };

      _this.onDrawFinish(canvasRect);
    },

    exitEditMode: function(event) {
      var _this = this;
      this.setOsdFrozen(false);
      this.osdViewer.removeHandler('canvas-drag', _this.startRectangle);
      this.osdViewer.removeHandler('canvas-release', _this.finishRectangle);
      this.onModeExit();
    },

    setOsdFrozen: function(freeze) {
      if (freeze) {
        // Control the openSeadragon canvas behaviour
        // so that it doesn't move around while we're
        // trying to edit our rectangle.
        this.osdViewer.panHorizontal = false;
        this.osdViewer.panVertical = false;
      } else {
        this.osdViewer.panHorizontal = true;
        this.osdViewer.panVertical = true;
      }
    },

    createNewRect: function(mouseStart) {
      var x = mouseStart.x,
      y = mouseStart.y,
      width = 0,
      height = 0;
      this.rectangle = new OpenSeadragon.Rect(x, y, width, height);
      this.osdOverlay = document.createElement('div');
      this.osdOverlay.className = 'osd-select-rectangle';
      this.osdViewer.addOverlay({
        element: this.osdOverlay,
        location: this.rectangle
      });
    },

    updateRectangle: function(mouseStart, mouseNow) {
      var topLeft = {
        x:Math.min(mouseStart.x, mouseNow.x),
        y:Math.min(mouseStart.y, mouseNow.y)
      },
      bottomRight = {
        x:Math.max(mouseStart.x, mouseNow.x),
        y:Math.max(mouseStart.y, mouseNow.y)
      };

      this.rectangle.x = topLeft.x;
      this.rectangle.y = topLeft.y;
      this.rectangle.width  = bottomRight.x - topLeft.x;
      this.rectangle.height = bottomRight.y - topLeft.y;

      this.osdViewer.updateOverlay(this.osdOverlay, this.rectangle);
    },

    //Currently the rect is
    // kept in openSeaDragon format until it is returned on "onDrawFinish".
    // The intent here is to update the annotation continuously rather than
    // only on the end of the draw event so rendering is always handled by
    // renderer instead of only at the end of the process, since different
    // rendering methods may be used.

    onDrawFinishOld: function(canvasRect) {
      var parent = this.parent,
      _this = this;

      var topLeftImagePoint = new OpenSeadragon.Point(canvasRect.x, canvasRect.y);

    },

    onDrawFinish: function(canvasRect) {
      var _this = this,
      parent = this.parent,
      annoTooltip = new $.AnnotationTooltip(); //pass permissions
      var tooltip = jQuery(this.osdOverlay).qtip({
           content: {
            text : annoTooltip.editorTemplate()
            },
            position : {
              at: 'center',
              viewport: jQuery(window),
              container: jQuery(_this.osdViewer.element)
            },
            style : {
              classes : 'qtip-bootstrap'
            },
            show: {
              ready: true
            },
            hide: {
              fixed: true,
              delay: 300,
              event: false
            },
            events: {
              render: function(event, api) {

                /*tinymce.init({
                  selector : 'form.annotation-tooltip textarea',
                  plugins: "image link media",
                  menubar: false,
                  statusbar: false,
                  toolbar_items_size: 'small',
                  toolbar: "bold italic | bullist numlist | link image media"
                });*/

                jQuery('.annotation-tooltip').on("submit", function(event) {
                  event.preventDefault();
                  jQuery('.annotation-tooltip a.save').click();
                });

                jQuery('.annotation-tooltip a.cancel').on("click", function(event) {
                  event.preventDefault();
                  api.destroy();
                  _this.osdViewer.removeOverlay(_this.osdOverlay);
                });

                jQuery('.annotation-tooltip a.save').on("click", function(event) {
                  event.preventDefault();
                  var tagText = jQuery(this).parents('.new-annotation-form').find('.tags-editor').val();
                  //var resourceText = tinymce.activeEditor.getContent();
                  var resourceText = $.trimString(jQuery(this).parents('.new-annotation-form').find('.text-editor').val());
                  var tags = [];
                  tagText = $.trimString(tagText);
                  if (tagText) {
                    tags = tagText.split(/\s+/);
                  }

                  var bounds = _this.osdViewer.viewport.getBounds(true);
                  var scope = _this.osdViewer.viewport.viewportToImageRectangle(bounds);
                  //bounds is giving negative values?

                  var motivation = [],
                  resource = [],
                  on;

                  if (tags && tags.length > 0) {
                   motivation.push("oa:tagging");
                   jQuery.each(tags, function(index, value) {
                    resource.push({
                     "@type":"oa:Tag",
                     "chars":value
                    });
                   });
                  }
                  motivation.push("oa:commenting");
                  on = { "@type" : "oa:SpecificResource",
                  "source" : parent.parent.canvasID,
                  "selector" : {
                    "@type" : "oa:FragmentSelector",
                    "value" : "xywh="+canvasRect.x+","+canvasRect.y+","+canvasRect.width+","+canvasRect.height
                  },
                  "scope": {
                    "@context" : "http://www.harvard.edu/catch/oa.json",
                    "@type" : "catch:Viewport",
                    "value" : "xywh="+Math.round(scope.x)+","+Math.round(scope.y)+","+Math.round(scope.width)+","+Math.round(scope.height) //osd bounds
                  }
                };
                resource.push( {
                  "@type" : "dctypes:Text",
                  "format" : "text/html",
                  "chars" : resourceText
                });
                var oaAnno = {
                 "@context" : "http://iiif.io/api/presentation/2/context.json",
                 "@type" : "oa:Annotation",
                 "motivation" : motivation,
                 "resource" : resource,
                 "on" : on
                };
                  //save to endpoint
                jQuery.publish('annotationCreated.'+parent.windowId, [oaAnno, _this.osdOverlay]);

                //update content of this qtip to make it a viewer, not editor
                api.destroy();
                });
              }
            }
         });
    },

    onDrawStart: function() { // use new $.oaAnnotation() to create new
        // annotation and pass it around for updating
    },

    onModeEnter: function() { // do reasonable things to the renderer to make
        // things intelligible
    },

    onModeExit: function() {
        // do reasonable things to renderer to return to "normal".
    },

    onDraw: function() {
        // update annotation
    }

    // MIGHT BE NICE IF...:
    //
    // If the user is mid-drag and hits the side of the
    // canvas, the canvas auto-pans and auto-zooms out
    // to accomodate the rectangle.
    //
    // The size of the rectangle just before colliding with
    // the canvas is auto-saved, so that the canvas can shrink
    // back down again if the user starts shrinking it in
    // mid-drag, allowing the auto-shrinking to stop when
    // the original size of the rectangle is reached again.
    //
    // The existing rectangles should also be moveable by
    // shift-clicking and dragging them, showing the
    // cross-hair cursor type.

//     osdRegionRectTool = {
//       enterEditMode: enterEditMode,
//       exitEditMode: exitEditMode
//     };
//
//     return osdRegionRectTool;

  };
}(Mirador));

(function($) {

  $.WorkspaceLockController = function(options) {

     jQuery.extend(true, this, {

     }, $.DEFAULT_SETTINGS, options);

  };

  $.WorkspaceLockController.prototype = {

  };

}(Mirador));


(function($) {

  $.Slot = function(options) {

    jQuery.extend(true, this, {
      workspaceSlotCls: 'slot',
      slotID:           null,
      layoutAddress:    null,
      focused:          null,
      appendTo:         null,
      parent:           null,
      window:           null,
      windowElement:    null
    }, options);

    this.init();

  };

  $.Slot.prototype = {
    init: function () {
      this.element = jQuery(this.template({
        workspaceSlotCls: this.workspaceSlotCls,
        slotID: this.slotId
      }));
      this.element.appendTo(this.appendTo);

      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;

      this.element.find('.addItemLink').on('click', function(){ _this.addItem(); });
      this.element.find('.remove-slot-option').on('click', function(){
        _this.parent.removeNode(_this);
      });
      jQuery.subscribe('windowRemoved', function(event, id) {
        if (_this.window && _this.window.id === id) {
          // This prevents the save controller
          // from attempting to re-save the window
          // after having already removed it.
          _this.clearSlot();
        }
      });
      jQuery.subscribe('layoutChanged', function(event, layoutRoot) {
        if (_this.parent.slots.length <= 1) {
          _this.element.find('.remove-slot-option').hide();
        } else {
          _this.element.find('.remove-slot-option').show();
        }

        // Must reset the slotAddress of the window.
        if (_this.window) {
          _this.window.slotAddress = _this.layoutAddress;
          jQuery.publish('windowUpdated', {
            id: _this.window.id,
            slotAddress: _this.window.slotAddress
          });
        }
      });
    },

    clearSlot: function() {
      if (this.window) {
        this.window.element.remove();
        delete this.window;
      }
    },

    addItem: function() {
      var _this = this;
      _this.focused = true;

      _this.parent.addItem(_this);
    },

    // template should be based on workspace type
    template: Handlebars.compile([
                                 '<div id="{{slotID}}" class="{{workspaceSlotCls}}">',
                                 '<div class="slotIconContainer">',
                                 // '<a href="javascript:;" class="mirador-btn mirador-icon-window-menu" title="Replace object"><i class="fa fa-table fa-lg fa-fw"></i>',
                                 // '<ul class="dropdown slot-controls">',
                                 // '<li class="new-object-option"><i class="fa fa-plus-square fa-lg fa-fw"></i> New Object</li>',
                                 // '<li class="remove-object-option"><i class="fa fa-times fa-lg fa-fw"></i> Close</li>',
                                 // '<li class="add-slot-right"><i class="fa fa-caret-square-o-right fa-lg fa-fw"></i> Add Slot Right</li>',
                                 // '<li class="add-slot-left"><i class="fa fa-caret-square-o-left fa-lg fa-fw"></i> Add Slot Left</li>',
                                 // '<li class="add-slot-above"><i class="fa fa-caret-square-o-up fa-lg fa-fw"></i> Add Slot Above</li>',
                                 // '<li class="add-slot-below"><i class="fa fa-caret-square-o-down fa-lg fa-fw"></i> Add Slot Below</li>',
                                 // '</ul>',
                                 // '</a>',
                                 '<h1 class="plus">+</h1>',
                                 '<h1>Add Item</h1>',
                                 '</div>',
                                 '<a class="addItemLink"></a>',
                                 '<a class="remove-slot-option"><i class="fa fa-times fa-lg fa-fw"></i> Close</a>',
                                 '</div>'
    ].join(''))
  };

}(Mirador));


(function($) {

  $.Window = function(options) {

    jQuery.extend(this, {
      element:           null,
      scrollImageRatio:  0.9,
      manifest:          null,
      currentCanvasID:    null,
      focusImages:       [],
      imagesList:        null,
      annotationsList:   [],
      endpoint:          null,
      slotAddress:     null,
      currentImageMode:  'ImageView',
      imageModes:        ['ImageView', 'BookView'],
      currentFocus:      'ThumbnailsView',
      focusesOriginal:   ['ThumbnailsView', 'ImageView', 'ScrollView', 'BookView'],
      focuses:           ['ThumbnailsView', 'ImageView', 'ScrollView', 'BookView'],
      focusModules:           {'ThumbnailsView': null, 'ImageView': null, 'ScrollView': null, 'BookView': null},
      focusOverlaysAvailable: {
        'ThumbnailsView': {
          'overlay' : {'MetadataView' : false},
          'sidePanel' : {'TableOfContents' : true},
          'bottomPanel' : {'' : false}
        },
        'ImageView': {
          'overlay' : {'MetadataView' : false},
          'sidePanel' : {'TableOfContents' : true},
          'bottomPanel' : {'ThumbnailsView' : true}
        },
        'ScrollView': {
          'overlay' : {'MetadataView' : false},
          'sidePanel' : {'TableOfContents' : true},
          'bottomPanel' : {'' : false}
        },
        'BookView': {
          'overlay' : {'MetadataView' : false},
          'sidePanel' : {'TableOfContents' : true},
          'bottomPanel' : {'ThumbnailsView' : true}
        }
      },
      focusOptions: null,
      id : null,
      sidePanel: null,
      bottomPanel: null,
      bottomPanelVisible: true,
      overlay: null,
      annotationLayerAvailable: true,
      annoEndpointAvailable : false,
      displayLayout: true,
      layoutOptions : {
        "newObject" : true,
        "close" : true,
        "slotRight" : true,
        "slotLeft" : true,
        "slotAbove" : true,
        "slotBelow" : true
      }
    }, options);

    this.init();
    this.bindAnnotationEvents();

  };

  $.Window.prototype = {
    init: function () {
      var _this = this,
      manifest = _this.manifest.jsonLd,
      focusState = _this.currentFocus,
      templateData = {},
      endpoint = null;

      //make sure annotations list is cleared out when changing objects within window
      while(_this.annotationsList.length > 0) {
        _this.annotationsList.pop();
      }
      //unsubscribe from stale events as they will be updated with new module calls
      jQuery.unsubscribe(('currentCanvasIDUpdated.' + _this.id));

      _this.removeBookView();

      //remove any imageModes that are not available as a focus
      this.imageModes = jQuery.map(this.imageModes, function(value, index) {
        if (jQuery.inArray(value, _this.focuses) === -1) return null;
        return value;
      });

      _this.imagesList = _this.manifest.getCanvases();
      if (!_this.currentCanvasID) {
        _this.currentCanvasID = _this.imagesList[0]['@id'];
      }

      this.annoEndpointAvailable = !jQuery.isEmptyObject($.viewer.annotationEndpoint);
      _this.getAnnotations();

      //check config
      if (typeof this.bottomPanelAvailable !== 'undefined' && !this.bottomPanelAvailable) {
        jQuery.each(this.focusOverlaysAvailable, function(key, value) {
          _this.focusOverlaysAvailable[key].bottomPanel = {'' : false};
        });
      }
      if (typeof this.sidePanelAvailable !== 'undefined' && !this.sidePanelAvailable) {
        jQuery.each(this.focusOverlaysAvailable, function(key, value) {
          _this.focusOverlaysAvailable[key].sidePanel = {'' : false};
        });
        templateData.sidePanel = false;
      } else {
        templateData.sidePanel = true;
      }
      if (typeof this.overlayAvailable !== 'undefined' && !this.overlayAvailable) {
        jQuery.each(this.focusOverlaysAvailable, function(key, value) {
          _this.focusOverlaysAvailable[key].overlay = {'' : false};
        });
      } else {
        templateData.MetadataView = true;
      }

      //determine if any buttons should be hidden in template
      jQuery.each(this.focuses, function(index, value) {
        templateData[value] = true;
      });
      templateData.title = manifest.label;
      templateData.displayLayout = this.displayLayout;
      templateData.layoutOptions = this.layoutOptions;
      // if displayLayout is true,  but all individual options are set to false, set displayLayout to false
      if (this.displayLayout) {
        templateData.displayLayout = !Object.keys(this.layoutOptions).every(function(element, index, array) {
          return _this.layoutOptions[element] === false;
        });
      }
      _this.element = jQuery(this.template(templateData)).appendTo(_this.appendTo);

      //clear any existing objects
      _this.clearViews();
      _this.clearPanelsAndOverlay();

      //attach view and toggle view, which triggers the attachment of panels or overlays
      _this.bindNavigation();
      switch(focusState) {
        case 'ThumbnailsView':
          _this.toggleThumbnails(_this.currentCanvasID);
        break;
        case 'ImageView':
          _this.toggleImageView(_this.currentCanvasID);
        break;
        case 'BookView':
          _this.toggleBookView(_this.currentCanvasID);
        break;
        case 'ScrollView':
          _this.toggleScrollView(_this.currentCanvasID);
        break;
        default:
          break;
      }

      if ($.viewer.workspace.slots.length <= 1) {
        _this.element.find('.remove-object-option').hide();
      }

      this.bindEvents();

      if (this.imagesList.length === 1) {
        this.bottomPanelVisibility(false);
      }
    },

    update: function(options) {
      jQuery.extend(this, options);
      this.init();
    },

    // spawnInWorkspace: function() {

    // },

    // reset whether BookView is available every time as a user might switch between paged and non-paged objects within a single slot/window
    removeBookView: function() {
      var _this = this;
      this.focuses = this.focusesOriginal;
      var manifest = this.manifest.jsonLd;
      if (manifest.sequences[0].viewingHint) {
        if (manifest.sequences[0].viewingHint.toLowerCase() !== 'paged') {
          //disable bookview for this object because it's not a paged object
          this.focuses = jQuery.grep(this.focuses, function(value) {
            return value !== 'BookView';
          });
        }
      }
    },

    bindEvents: function() {
      var _this = this;

      //this event should trigger from layout
      jQuery.subscribe('windowResize', $.debounce(function(){
        if (_this.focusModules.ScrollView) {
          var containerHeight = _this.element.find('.view-container').height();
          var triggerShow = false;
          if (_this.currentFocus === "ScrollView") {
            triggerShow = true;
          }
          _this.focusModules.ScrollView.reloadImages(Math.floor(containerHeight * _this.scrollImageRatio), triggerShow);
        }
      }, 300));

      jQuery.subscribe('bottomPanelSet.' + _this.id, function(event, visible) {
        var panel = _this.element.find('.bottomPanel');
        if (visible === true) {
          panel.css({transform: 'translateY(0)'});
        } else {
          panel.css({transform: 'translateY(100%)'});
        }
      });

      jQuery.subscribe('layoutChanged', function(event, layoutRoot) {
        if ($.viewer.workspace.slots.length <= 1) {
          _this.element.find('.remove-object-option').hide();
        } else {
          _this.element.find('.remove-object-option').show();
        }
      });
    },

    bindAnnotationEvents: function() {
      var _this = this;
      jQuery.subscribe('annotationCreated.'+_this.id, function(event, oaAnno, osdOverlay) {
        var annoID;
        //first function is success callback, second is error callback
        endpoint.create(oaAnno, function(data) {
          annoID = String(data.id); //just in case it returns a number
          oaAnno['@id'] = annoID;
          _this.annotationsList.push(oaAnno);
          //update overlay so it can be a part of the annotationList rendering
          jQuery(osdOverlay).removeClass('osd-select-rectangle').addClass('annotation').attr('id', annoID);
          jQuery.publish(('annotationListLoaded.' + _this.id));
        },
        function() {
          //provide useful feedback to user
          console.log("There was an error saving this new annotation");
          //remove this overlay because we couldn't save annotation
          jQuery(osdOverlay).remove();
        });
      });

      jQuery.subscribe('annotationUpdated.'+_this.id, function(event, oaAnno) {
        //first function is success callback, second is error callback
        endpoint.update(oaAnno, function() {
          //successfully updated anno
        },
        function() {
          console.log("There was an error updating this annotation");
        });
      });

      jQuery.subscribe('annotationDeleted.'+_this.id, function(event, oaAnno) {
        //remove from endpoint
        //first function is success callback, second is error callback
        endpoint.deleteAnnotation(oaAnno['@id'], function() {
          _this.annotationsList = jQuery.grep(_this.annotationsList, function(e){ return e['@id'] !== oaAnno['@id']; });
          jQuery.publish(('annotationListLoaded.' + _this.id));
        },
        function() {
          // console.log("There was an error deleting this annotation");
        });
      });
    },

    clearViews: function() {
      var _this = this;
      jQuery.each(_this.focusModules, function(key, value) {
        _this.focusModules[key] = null;
      });
    },

    clearPanelsAndOverlay: function() {
      this.sidePanel = null;
      this.bottomPanel = null;
      this.overlay = null;
    },

    // only panels and overlay available to this view, make rest hidden while on this view
    updatePanelsAndOverlay: function(state) {
      var _this = this;

      jQuery.each(this.focusOverlaysAvailable[state], function(panelType, viewOptions) {
        jQuery.each(viewOptions, function(view, displayed) {
          //instantiate any panels that exist for this view but are still null
          if (view !== '' && _this[panelType] === null) {
            _this[panelType] = new $[view]({
              manifest: _this.manifest,
              appendTo: _this.element.find('.'+panelType),
              parent: _this,
              panel: true,
              canvasID: _this.currentCanvasID,
              imagesList: _this.imagesList,
              thumbInfo: {thumbsHeight: 80, listingCssCls: 'panel-listing-thumbs', thumbnailCls: 'panel-thumbnail-view'}
            });
          }

          //refresh displayed in case TableOfContents module changed it
          displayed = _this.focusOverlaysAvailable[state][panelType][view];

          //toggle any valid panels
          if (view !== '' && displayed) {
            _this.togglePanels(panelType, displayed, view, state);
          }

          //hide any panels instantiated but not available to this view
          if (view === '' && _this[panelType]) {
            _this.togglePanels(panelType, displayed, view, state);
          }

          //lastly, adjust height for non-existent panels
          if (view === '') {
            _this.adjustFocusSize(panelType, displayed);
          }

          //update current image for all valid panels
        });
      });

      //update panels with current image
      if (this.bottomPanel) { this.bottomPanel.updateFocusImages(this.focusImages); }
    },

    get: function(prop, parent) {
      if (parent) {
        return this[parent][prop];
      }
      return this[prop];
    },

    set: function(prop, value, options) {
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
    },

    setTOCBoolean: function(boolValue) {
      var _this = this;
      jQuery.each(this.focusOverlaysAvailable, function(key, value) {
        _this.focusOverlaysAvailable[key].sidePanel.TableOfContents = boolValue;
      });
      //remove thumbnail icon if not available for this object
      if (!boolValue) {
        this.element.find('.mirador-icon-toc').hide();
      }
    },

    togglePanels: function(panelType, panelState, viewType, focusState) {
      //update state in focusOverlaysAvailable
      this.focusOverlaysAvailable[focusState][panelType][viewType] = panelState;
      this[panelType].toggle(panelState);
      this.adjustFocusSize(panelType, panelState);
    },

    minMaxSidePanel: function(element) {
      if (this.element.find('.sidePanel').hasClass('minimized')) {
        element.find('.fa-list').switchClass('fa-list', 'fa-caret-down');
        element.addClass('selected').css('background','#efefef');
        this.element.find('.sidePanel').removeClass('minimized').width(280).css('border-right', '1px solid lightgray');
        this.element.find('.view-container').css('margin-left', 280);
      } else {
        element.find('.fa-caret-down').switchClass('fa-caret-down', 'fa-list');
        element.removeClass('selected').css('background', '#fafafa');
        this.element.find('.view-container').css('margin-left', 0);
        this.element.find('.sidePanel').addClass('minimized').css('border', 'none').width(0);
      }
    },

    adjustFocusSize: function(panelType, panelState) {
      if (panelType === 'bottomPanel') {
        this.focusModules[this.currentFocus].adjustHeight('focus-max-height', panelState);
      } else if (panelType === 'sidePanel') {
        this.focusModules[this.currentFocus].adjustWidth('focus-max-width', panelState);
      } else {}
    },

    toggleMetadataOverlay: function(focusState) {
      var _this = this;
      var currentState = this.focusOverlaysAvailable[focusState].overlay.MetadataView;
      if (currentState) {
        this.element.find('.mirador-icon-metadata-view').removeClass('selected');
      } else {
        this.element.find('.mirador-icon-metadata-view').addClass('selected');
      }
      //set overlay for all focus types to same value
      jQuery.each(this.focusOverlaysAvailable, function(focusType, options) {
        if (focusState !== focusType) {
          this.overlay.MetadataView = !currentState;
        }
      });
      //and then do toggling for current focus
      this.togglePanels('overlay', !currentState, 'MetadataView', focusState);
    },

    toggleFocus: function(focusState, imageMode) {
      var _this = this;

      this.currentFocus = focusState;
      if (imageMode && jQuery.inArray(imageMode, this.imageModes) > -1) {
        this.currentImageMode = imageMode;
      }
      //set other focusStates to false (toggle to display none)
      jQuery.each(this.focusModules, function(focusKey, module) {
        if (module && focusState !== focusKey) {
          module.toggle(false);
        }
      });
      this.focusModules[focusState].toggle(true);
      this.updateManifestInfo();
      this.updatePanelsAndOverlay(focusState);
      jQuery.publish("windowUpdated", {
        id: _this.id,
        viewType: _this.currentFocus,
        canvasID: _this.currentCanvasID,
        imageMode: _this.currentImageMode,
        loadedManifest: _this.manifest.jsonLd['@id'],
        slotAddress: _this.slotAddress
      });
    },

    toggleThumbnails: function(canvasID) {
      this.currentCanvasID = canvasID;
      if (this.focusModules.ThumbnailsView === null) {
        this.focusModules.ThumbnailsView = new $.ThumbnailsView( {manifest: this.manifest, appendTo: this.element.find('.view-container'), parent: this, canvasID: this.currentCanvasID, imagesList: this.imagesList} );
      } else {
        var view = this.focusModules.ThumbnailsView;
        view.updateImage(canvasID);
      }
      this.toggleFocus('ThumbnailsView', '');
    },

    toggleImageView: function(canvasID) {
      this.currentCanvasID = canvasID;
      if (this.focusModules.ImageView === null) {
        this.focusModules.ImageView = new $.ImageView({
          manifest: this.manifest,
          appendTo: this.element.find('.view-container'),
          parent: this,
          windowId: this.id,
          canvasID: canvasID,
          imagesList: this.imagesList,
          osdOptions: this.focusOptions,
          bottomPanelAvailable: this.bottomPanelAvailable,
          annotationLayerAvailable: this.annotationLayerAvailable,
          annoEndpointAvailable: this.annoEndpointAvailable} );
      } else {
        var view = this.focusModules.ImageView;
        view.updateImage(canvasID);
      }
      this.toggleFocus('ImageView', 'ImageView');
    },

    toggleBookView: function(canvasID) {
      this.currentCanvasID = canvasID;
      if (this.focusModules.BookView === null) {
        this.focusModules.BookView = new $.BookView({
          manifest: this.manifest,
          appendTo: this.element.find('.view-container'),
          parent: this,
          windowId: this.id,
          canvasID: canvasID,
          imagesList: this.imagesList,
          osdOptions: this.focusOptions,
          bottomPanelAvailable: this.bottomPanelAvailable
        });
      } else {
        var view = this.focusModules.BookView;
        view.updateImage(canvasID);
      }
      this.toggleFocus('BookView', 'BookView');
    },

    toggleScrollView: function(canvasID) {
      this.currentCanvasID = canvasID;
      if (this.focusModules.ScrollView === null) {
        var containerHeight = this.element.find('.view-container').height();
        this.focusModules.ScrollView = new $.ScrollView({
          manifest: this.manifest,
          appendTo: this.element.find('.view-container'),
          parent: this,
          canvasID: this.currentCanvasID,
          imagesList: this.imagesList,
          thumbInfo: {thumbsHeight: Math.floor(containerHeight * this.scrollImageRatio), listingCssCls: 'scroll-listing-thumbs', thumbnailCls: 'scroll-view'}
        });
      } else {
        var view = this.focusModules.ScrollView;
        view.updateImage(canvasID);
      }
      this.toggleFocus('ScrollView', '');
    },

    updateFocusImages: function(imageList) {
      this.focusImages = imageList;
    },

    setCurrentCanvasID: function(canvasID) {
      var _this = this;
      this.currentCanvasID = canvasID;
      jQuery.unsubscribe(('annotationListLoaded.' + _this.id));
      jQuery.publish('removeTooltips.' + _this.id);
      while(_this.annotationsList.length > 0) {
        _this.annotationsList.pop();
      }
      this.getAnnotations();
      switch(this.currentImageMode) {
        case 'ImageView':
          this.toggleImageView(this.currentCanvasID);
        break;
        case 'BookView':
          this.toggleBookView(this.currentCanvasID);
        break;
        default:
          break;
      }
      jQuery.publish(('currentCanvasIDUpdated.' + _this.id), canvasID);
    },

    replaceWindow: function(newSlotAddress, newElement) {
      this.slotAddress = newSlotAddress;
      this.appendTo = newElement;
      this.update();
    },

    bottomPanelVisibility: function(visible) {
      var _this = this;
      _this.bottomPanelVisible = visible;
      jQuery.publish(('bottomPanelSet.' + _this.id), visible);
    },

    setCursorFrameStart: function(canvasID) {
    },

    updateManifestInfo: function() {
      var _this = this;
      this.element.find('.window-manifest-navigation').children().removeClass('selected');
      switch(_this.currentFocus) {
        case 'ThumbnailsView':
          //hide thumbnails button and highlight currentImageMode?
          _this.element.find('.mirador-icon-thumbs-view').addClass('selected');
        break;
        case 'ImageView':
          //highlight Single Image View option
          _this.element.find('.mirador-icon-image-view').addClass('selected');
        break;
        case 'BookView':
          //highlight Book View option
          _this.element.find('.mirador-icon-image-view').addClass('selected');
        break;
        case 'ScrollView':
          //highlight Scroll View option
          _this.element.find('.mirador-icon-thumbs-view').addClass('selected');
        break;
        default:
          break;
      }

      if (this.focusOverlaysAvailable[this.currentFocus].overlay.MetadataView) {
        this.element.find('.mirador-icon-metadata-view').addClass('selected');
      }
    },

    /*
       Merge all annotations for current image/canvas from various sources
       Pass to any widgets that will use this list
       */
    getAnnotations: function() {
      //first look for manifest annotations
      var _this = this,
      url = _this.manifest.getAnnotationsListUrl(_this.currentCanvasID);

      if (url !== false) {
        jQuery.get(url, function(list) {
          _this.annotationsList = _this.annotationsList.concat(list.resources);
          jQuery.each(_this.annotationsList, function(index, value) {
            //if there is no ID for this annotation, set a random one
            if (typeof value['@id'] === 'undefined') {
              value['@id'] = $.genUUID();
            }
            //indicate this is a manifest annotation - which affects the UI
            value.endpoint = "manifest";
          });
          jQuery.publish('annotationListLoaded.' + _this.id);
        });
      }

      // next check endpoint
      if (this.annoEndpointAvailable) {
        var dfd = jQuery.Deferred(),
        module = $.viewer.annotationEndpoint.module,
        options = $.viewer.annotationEndpoint.options;
        if (_this.endpoint && _this.endpoint !== null) {
          endpoint.set('dfd', dfd);
          endpoint.search(_this.currentCanvasID);
          // update with new search
        } else {
          options.element = _this.element;
          options.uri = _this.currentCanvasID;
          options.dfd = dfd;
          options.windowID = _this.id;
          endpoint = new $[module](options);
        }
        dfd.done(function(loaded) {
          _this.annotationsList = _this.annotationsList.concat(endpoint.annotationsList);
          // clear out some bad data
          _this.annotationsList = jQuery.grep(_this.annotationsList, function (value, index) {
            if (typeof value.on === "undefined") {
              return false;
            }
            return true;
          });
          jQuery.publish('annotationListLoaded.' + _this.id);
        });
      }
    },

    // based on currentFocus
    bindNavigation: function() {
      var _this = this;

    this.element.find('.mirador-icon-image-view').on('mouseenter',
      function() {
      _this.element.find('.image-list').stop().slideFadeToggle(300);
    }).on('mouseleave',
    function() {
      _this.element.find('.image-list').stop().slideFadeToggle(300);
    });

    this.element.find('.mirador-icon-window-menu').on('mouseenter',
      function() {
      _this.element.find('.slot-controls').stop().slideFadeToggle(300);
    }).on('mouseleave',
    function() {
      _this.element.find('.slot-controls').stop().slideFadeToggle(300);
    });

    this.element.find('.single-image-option').on('click', function() {
      _this.toggleImageView(_this.currentCanvasID);
    });

    this.element.find('.book-option').on('click', function() {
      _this.toggleBookView(_this.currentCanvasID);
    });

    this.element.find('.scroll-option').on('click', function() {
      _this.toggleScrollView(_this.currentCanvasID);
    });

    this.element.find('.thumbnails-option').on('click', function() {
      _this.toggleThumbnails(_this.currentCanvasID);
    });

    this.element.find('.mirador-icon-metadata-view').on('click', function() {
      _this.toggleMetadataOverlay(_this.currentFocus);
    });

    this.element.find('.mirador-icon-toc').on('click', function() {
      _this.minMaxSidePanel(jQuery(this));
    });

    this.element.find('.new-object-option').on('click', function() {
      _this.parent.addItem();
    });

    this.element.find('.remove-object-option').on('click', function() {
      $.viewer.workspace.removeNode(_this.parent);
    });

    this.element.find('.add-slot-right').on('click', function() {
      $.viewer.workspace.splitRight(_this.parent);
    });

    this.element.find('.add-slot-left').on('click', function() {
      $.viewer.workspace.splitLeft(_this.parent);
    });

    this.element.find('.add-slot-below').on('click', function() {
      $.viewer.workspace.splitDown(_this.parent);
    });

    this.element.find('.add-slot-above').on('click', function() {
      $.viewer.workspace.splitUp(_this.parent);
    });
    },

    // template should be based on workspace type
    template: Handlebars.compile([
                                 '<div class="window">',
                                 '<div class="manifest-info">',
                                 '<div class="window-manifest-navigation">',
                                 '<a href="javascript:;" class="mirador-btn mirador-icon-image-view"><i class="fa fa-photo fa-lg fa-fw"></i>',
                                 '<ul class="dropdown image-list">',
                                 '{{#if ImageView}}',
                                 '<li class="single-image-option"><i class="fas fa-photo fa-lg fa-fw"></i> Image View</li>',
                                 '{{/if}}',
                                 '{{#if BookView}}',
                                 '<li class="book-option"><i class="fas fa-columns fa-lg fa-fw"></i> Book View</li>',
                                 '{{/if}}',
                                 '{{#if ScrollView}}',
                                 '<li class="scroll-option"><i class="fas fa-ellipsis-h fa-lg fa-fw"></i> Scroll View</li>',
                                 '{{/if}}',
                                 '</ul>',
                                 '</a>',
                                 '{{#if ThumbnailsView}}',
                                 '<a href="javascript:;" class="mirador-btn mirador-icon-thumbs-view thumbnails-option"><i class="fas fa-th fa-lg fa-rotate-90 fa-fw"></i>',
                                 '</a>',
                                 '{{/if}}',
                                 '{{#if MetadataView}}',
                                 '<a href="javascript:;" class="mirador-btn mirador-icon-metadata-view" title="Object Metadata"><i class="fas fa-info-circle fa-lg fa-fw"></i></a>',
                                 '{{/if}}',
                                 '</div>',
                                 '{{#if displayLayout}}',
                                 '<a href="javascript:;" class="mirador-btn mirador-icon-window-menu" title="Change Layout"><i class="fas fa-table fa-lg fa-fw"></i>',
                                 '<ul class="dropdown slot-controls">',
                                 '{{#if layoutOptions.newObject}}',
                                 '<li class="new-object-option"><i class="fas fa-plus-square fa-lg fa-fw"></i> New Object</li>',
                                 '{{/if}}',
                                 '{{#if layoutOptions.close}}',
                                 '<li class="remove-object-option"><i class="fas fa-times fa-lg fa-fw"></i> Close</li>',
                                 '{{/if}}',
                                 '{{#if layoutOptions.slotRight}}',
                                 '<li class="add-slot-right"><i class="fas fa-caret-square-o-right fa-lg fa-fw"></i> Add Slot Right</li>',
                                 '{{/if}}',
                                 '{{#if layoutOptions.slotLeft}}',
                                 '<li class="add-slot-left"><i class="fas fa-caret-square-o-left fa-lg fa-fw"></i> Add Slot Left</li>',
                                 '{{/if}}',
                                 '{{#if layoutOptions.slotAbove}}',
                                 '<li class="add-slot-above"><i class="fas fa-caret-square-o-up fa-lg fa-fw"></i> Add Slot Above</li>',
                                 '{{/if}}',
                                 '{{#if layoutOptions.slotBelow}}',
                                 '<li class="add-slot-below"><i class="fas fa-caret-square-o-down fa-lg fa-fw"></i> Add Slot Below</li>',
                                 '{{/if}}',
                                 '</ul>',
                                 '</a>',
                                 '{{/if}}',
                                 '{{#if sidePanel}}',
                                 '<a href="javascript:;" class="mirador-btn mirador-icon-toc selected" title="View/Hide Table of Contents"><i class="fas fa-caret-down fa-lg fa-fw"></i></a>',
                                 '{{/if}}',
                                 '<h3 class="window-manifest-title">{{title}}</h3>',
                                 '</div>',
                                 '<div class="content-container">',
                                 '{{#if sidePanel}}',
                                 '<div class="sidePanel">',
                                 '</div>',
                                 '{{/if}}',
                                 '<div class="view-container {{#unless sidePanel}}focus-max-width{{/unless}}">',
                                 '<div class="overlay"></div>',
                                 '<div class="bottomPanel">',
                                 '</div>',
                                 '</div>',
                                 '</div>',
                                 '</div>'
    ].join(''))
  };

}(Mirador));


(function($) {

  $.AnnotationsLayer = function(options) {

    jQuery.extend(true, this, {
      parent:            null,
      annotationsList:   null,
      viewer:            null,
      renderer:          null,
      selected:          null,
      hovered:           null,
      windowId:          null,
      mode:              'default',
      element:           null
    }, options);

    this.init();
  };

  $.AnnotationsLayer.prototype = {

    init: function() {
      var _this = this;
      jQuery.unsubscribe(('modeChange.' + _this.windowId));

      this.createRenderer();
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;

      jQuery.subscribe('modeChange.' + _this.windowId, function(event, modeName) {
        _this.mode = modeName;
        _this.modeSwitch();
      });

      jQuery.subscribe('annotationListLoaded.' + _this.windowId, function(event) {
        _this.annotationsList = _this.parent.parent.annotationsList;
        _this.updateRenderer();
      });
    },

    createRenderer: function() {
      var _this = this;
      this.renderer = new $.OsdCanvasRenderer({
        osd: $.OpenSeadragon,
        osdViewer: _this.viewer,
        list: _this.annotationsList, // must be passed by reference.
        visible: false,
        parent: _this
      });
      this.modeSwitch();
    },

    updateRenderer: function() {
      this.renderer.list = this.annotationsList;
      this.modeSwitch();
    },

    modeSwitch: function() {
      //console.log(this.mode);
      if (this.mode === 'displayAnnotations') { this.enterDisplayAnnotations(); }
      else if (this.mode === 'editingAnnotations') { this.enterEditAnnotations(); }
      else if (this.mode === 'default') { this.enterDefault(); }
      else {}
    },


    enterDisplayAnnotations: function() {
      var _this = this;
      //console.log('triggering annotation loading and display');
      this.renderer.render();
    },

    enterEditAnnotations: function() {
      var _this = this;
      if (!this.parent.hud.contextControls.rectTool) {
        this.parent.hud.contextControls.rectTool = new $.OsdRegionRectTool({
          osd: OpenSeadragon,
          osdViewer: _this.viewer,
          rectType: 'oa', // does not do anything yet.
          parent: _this
        });
      } else {
        this.parent.hud.contextControls.rectTool.reset(_this.viewer);
      }
      this.renderer.render();
    },

    enterDefault: function() {
      this.renderer.hideAll();
    }

  };

}(Mirador));

(function($) {

  $.BookView = function(options) {

    jQuery.extend(this, {
      currentImg:       null,
      windowId:         null,
      currentImgIndex:  0,
      stitchList:       [],
      canvasID:          null,
      imagesList:       [],
      element:          null,
      focusImages:      [],
      manifest:         null,
      viewingDirection: 'left-to-right',
      viewingHint:      'paged',
      osd:              null,
      osdCls:           'mirador-osd',
      osdOptions: {
        osdBounds:        null,
        zoomLevel:        null
      },
      parent:           null,
      stitchTileMargin: 10
    }, options);

    this.init();
  };


  $.BookView.prototype = {

    init: function() {
      if (this.canvasID !== null) {
        this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      }

      if (!this.osdOptions) {
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
      }

      this.currentImg = this.imagesList[this.currentImgIndex];

      this.element = jQuery(this.template()).appendTo(this.appendTo);
      this.hud = new $.Hud({
        parent: this,
        element: this.element,
        bottomPanelAvailable: this.bottomPanelAvailable,
        windowId: this.windowId,
        annotationLayerAvailable: false
      });

      if (this.manifest.jsonLd.sequences[0].viewingDirection) {
        this.viewingDirection = this.manifest.jsonLd.sequences[0].viewingDirection.toLowerCase();
      }
      if (this.manifest.jsonLd.sequences[0].viewingHint) {
        this.viewingHint = this.manifest.jsonLd.sequences[0].viewingHint.toLowerCase();
      }

      this.stitchList = this.getStitchList();
      this.createOpenSeadragonInstance();
    },

    template: Handlebars.compile([
                                 '<div class="book-view">',
                                 '</div>'
    ].join('')),

    setBounds: function() {
      var _this = this;
      this.osdOptions.osdBounds = this.osd.viewport.getBounds(true);
      jQuery.publish("imageBoundsUpdated", {
        id: _this.parent.id,
        osdBounds: {x: _this.osdOptions.osdBounds.x, y: _this.osdOptions.osdBounds.y, width: _this.osdOptions.osdBounds.width, height: _this.osdOptions.osdBounds.height}
      });
    },

    toggle: function(stateValue) {
      if (stateValue) {
        this.show();
      } else {
        this.hide();
      }
    },

    hide: function() {
      jQuery(this.element).hide({effect: "fade", duration: 1000, easing: "easeOutCubic"});
    },

    show: function() {
      jQuery(this.element).show({effect: "fade", duration: 1000, easing: "easeInCubic"});
    },

    adjustWidth: function(className, hasClass) {
      if (hasClass) {
        this.parent.element.find('.view-container').removeClass(className);
      } else {
        this.parent.element.find('.view-container').addClass(className);
      }
    },

    adjustHeight: function(className, hasClass) {
      if (hasClass) {
        this.element.removeClass(className);
      } else {
        this.element.addClass(className);
      }
    },

    updateImage: function(canvasID) {
      this.canvasID = canvasID;
      this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      this.currentImg = this.imagesList[this.currentImgIndex];
      var newList = this.getStitchList();
      var is_same = this.stitchList.length == newList.length && this.stitchList.every(function(element, index) {
        return element === newList[index];
      });
      if (!is_same) {
        this.stitchList = newList;
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
        this.osd.close();
        this.createOpenSeadragonInstance();
      }
    },

    createOpenSeadragonInstance: function() {
      var uniqueID = $.genUUID(),
      osdId = 'mirador-osd-' + uniqueID,
      osdToolBarId = osdId + '-toolbar',
      elemOsd,
      tileSources = [],
      _this = this,
      toolbarID = 'osd-toolbar-' + uniqueID,
      dfd = jQuery.Deferred();

      this.element.find('.' + this.osdCls).remove();

      jQuery.each(this.stitchList, function(index, image) {
        var imageUrl = $.Iiif.getImageUrl(image),
        infoJsonUrl = imageUrl + '/info.json';

        jQuery.getJSON(infoJsonUrl).done(function (data, status, jqXHR) {
          tileSources.splice(index, 0, data);
          if (tileSources.length === _this.stitchList.length ) { dfd.resolve(); }
        });
      });

      dfd.done(function () {
        var aspectRatio = tileSources[0].height / tileSources[0].width;

        elemOsd =
          jQuery('<div/>')
        .addClass(_this.osdCls)
        .attr('id', osdId)
        .appendTo(_this.element);

        _this.osd = $.OpenSeadragon({
          'id':           elemOsd.attr('id'),
          'toolbarID' : toolbarID
        });

        _this.osd.addHandler('open', function(){
          _this.addLayer(tileSources.slice(1), aspectRatio);
          var addItemHandler = function( event ) {
            _this.osd.world.removeHandler( "add-item", addItemHandler );
            if (_this.osdOptions.osdBounds) {
              var rect = new OpenSeadragon.Rect(_this.osdOptions.osdBounds.x, _this.osdOptions.osdBounds.y, _this.osdOptions.osdBounds.width, _this.osdOptions.osdBounds.height);
              _this.osd.viewport.fitBounds(rect, true);
            } else {
              _this.osd.viewport.goHome(true);
            }
          };

          _this.osd.world.addHandler( "add-item", addItemHandler );

          _this.osd.addHandler('zoom', $.debounce(function(){
            _this.setBounds();
          }, 300));

          _this.osd.addHandler('pan', $.debounce(function(){
            _this.setBounds();
          }, 300));
        });

        _this.osd.open(tileSources[0], {opacity:1, x:0, y:0, width:1});
      });

    },

    addLayer: function(tileSources, aspectRatio) {
      var _this = this;
      jQuery.each(tileSources, function(index, value) {
        var newAR = (value.height / value.width);
        var options = {
          tileSource: value,
          opacity: 1,
          x: 1.01,
          y: 0,
          width: aspectRatio / newAR
        };
        _this.osd.addTiledImage(options);
      });
    },

    // next two pages for paged objects
    // need next single page for lining pages up
    // don't need for continuous or individuals
    next: function() {
      var next;
      if (this.currentImgIndex % 2 === 0) {
        next = this.currentImgIndex + 1;
      } else {
        next = this.currentImgIndex + 2;
      }
      if (next < this.imagesList.length) {
        this.parent.setCurrentCanvasID(this.imagesList[next]['@id']);
      }
    },

    // previous two pages for paged objects
    // need previous single page for lining things up
    // don't need for continuous or individuals
    previous: function() {
      var prev;
      if (this.currentImgIndex % 2 === 0) {
        prev = this.currentImgIndex - 2;
      } else {
        prev = this.currentImgIndex - 1;
      }
      if (prev >= 0) {
        this.parent.setCurrentCanvasID(this.imagesList[prev]['@id']);
      }
    },

    getStitchList: function() {
      // Need to check metadata for object type and viewing direction
      // Default to 'paged' and 'left-to-right'
      // Set index(es) for any other images to stitch with selected image
      var stitchList = [],
      leftIndex = [],
      rightIndex = [],
      topIndex = [],
      bottomIndex = [],
      _this = this;

      this.focusImages = [];

      if (this.viewingHint === 'individuals') {
        // don't do any stitching, display like an imageView
        stitchList = [this.currentImg];
      } else if (this.viewingHint === 'paged') {
        // determine the other image for this pair based on index and viewingDirection
        if (this.currentImgIndex === 0 || this.currentImgIndex === this.imagesList.length-1) {
          //first page (front cover) or last page (back cover), display on its own
          stitchList = [this.currentImg];
        } else if (this.currentImgIndex % 2 === 0) {
          // even, get previous page.  set order in array based on viewingDirection
          switch (this.viewingDirection) {
            case "left-to-right":
              leftIndex[0] = this.currentImgIndex-1;
            stitchList = [this.imagesList[this.currentImgIndex-1], this.currentImg];
            break;
            case "right-to-left":
              rightIndex[0] = this.currentImgIndex-1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex-1]];
            break;
            case "top-to-bottom":
              topIndex[0] = this.currentImgIndex-1;
            stitchList = [this.imagesList[this.currentImgIndex-1], this.currentImg];
            break;
            case "bottom-to-top":
              bottomIndex[0] = this.currentImgIndex-1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex-1]];
            break;
            default:
              break;
          }
        } else {
          // odd, get next page
          switch (this.viewingDirection) {
            case "left-to-right":
              rightIndex[0] = this.currentImgIndex+1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex+1]];
            break;
            case "right-to-left":
              leftIndex[0] = this.currentImgIndex+1;
            stitchList = [this.imagesList[this.currentImgIndex+1], this.currentImg];
            break;
            case "top-to-bottom":
              bottomIndex[0] = this.currentImgIndex+1;
            stitchList = [this.currentImg, this.imagesList[this.currentImgIndex+1]];
            break;
            case "bottom-to-top":
              topIndex[0] = this.currentImgIndex+1;
            stitchList = [this.imagesList[this.currentImgIndex+1], this.currentImg];
            break;
            default:
              break;
          }
        }
      } else if (this.viewingHint === 'continuous') {
        // TODO: stitch all images together per the viewingDirection
      } else {
        // undefined viewingHint, don't do anything
      }

      //set the focusImages for highlighting in panels
      jQuery.each(stitchList, function(index, image) {
        _this.focusImages.push(image['@id']);
      });
      this.parent.updateFocusImages(this.focusImages);
      return stitchList;
    }
  };

}(Mirador));

(function($) {

  $.ContextControls = function(options) {

    jQuery.extend(this, {
      parent: null,
      element: null,
      container: null,
      mode: null,
      windowId: null,
      rectTool: null,
      annoEndpointAvailable: false
    }, options);

    this.init();
  };

  $.ContextControls.prototype = {

    init: function() {
      this.element = jQuery(this.template()).appendTo(this.container);
      this.hide();
      this.bindEvents();
    },

    show: function() {
      this.element.show().fadeIn();
    },

    hide: function() {
      this.element.hide().fadeOut();
    },

    bindEvents: function() {
      var _this = this;

      this.container.find('.mirador-osd-close').on('click', function() {
        _this.parent.annoState.displayOff();
      });

      this.container.find('.mirador-osd-back').on('click', function() {
        _this.element.remove();
        _this.element = jQuery(_this.template()).appendTo(_this.container);
        _this.bindEvents();
      });

      this.container.find('.mirador-osd-edit-mode').on('click', function() {
        if (_this.parent.annoState.current === 'annoOnEditOff') {
          _this.parent.annoState.editOn();
        } else if (_this.parent.annoState.current === 'annoOnEditOn') {
          _this.parent.annoState.editOff();
        }
      });

    },

    template: Handlebars.compile([
                                 '<div class="mirador-osd-context-controls hud-container">',
                                   '<a class="mirador-osd-close hud-control">',
                                   '<i class="fas fa-2x fa-times"></i>',
                                   '</a>',
                                   '<a class="mirador-osd-edit-mode hud-control">',
                                   '<i class="fas fa-2x fa-edit"></i>',
                                   '</a>',
                                   /*'<a class="mirador-osd-list hud-control">',
                                   '<i class="fa fa-2x fa-list"></i>',
                                   '</a>',*/
                                   /*'<a class="mirador-osd-search hud-control">',
                                   '<i class="fa fa-2x fa-search"></i>',
                                   '</a>',*/
                                   /*'<a class="mirador-osd-rect-tool hud-control">',
                                   '<i class="fa fa-2x fa-gear"></i>',
                                   '</a>',*/
                                 '</div>'
    ].join('')),

    editorTemplate: Handlebars.compile([
                                 '<div class="mirador-osd-context-controls hud-container">',
                                   '<a class="mirador-osd-back hud-control">',
                                   '<i class="fas fa-2x fa-arrow-left"></i>',
                                   '</a>',
                                   '<a class="mirador-osd-rect-tool hud-control">',
                                   '<i class="fas fa-2x fa-pencil-square"></i>',
                                   '</a>',
                                   '<a class="mirador-osd-rect-tool hud-control">',
                                   '<i class="fas fa-2x fa-ellipsis-h"></i>',
                                   '</a>',
                                   '<a class="mirador-osd-rect-tool hud-control">',
                                   '<i class="fas fa-2x fa-gear"></i>',
                                   '</a>',
                                 '</div>'
    ].join(''))
  };
}(Mirador));

(function($) {

  $.Hud = function(options) {

    jQuery.extend(this, {
      element:   null,
      parent:    null,
      windowId:  null,
      annoState: null,
      showAnnotations: true,
      annoEndpointAvailable: false
    }, options);

    this.init();
  };

  $.Hud.prototype = {

    init: function() {
      this.createStateMachine();

      this.element = jQuery(this.template({
        showNextPrev : this.parent.imagesList.length !== 1,
        showBottomPanel : typeof this.bottomPanelAvailable === 'undefined' ? true : this.bottomPanelAvailable,
        showAnno : this.annotationLayerAvailable
      })).appendTo(this.element);

      if (this.annotationLayerAvailable && this.annoEndpointAvailable) {
        this.contextControls = new $.ContextControls({
          element: null,
          container: this.parent.element,
          mode: 'displayAnnotations',
          parent: this,
          windowId: this.windowId
        });
      }

      this.bindEvents();

      if (typeof this.bottomPanelAvailable !== 'undefined' && !this.bottomPanelAvailable) {
        this.parent.parent.bottomPanelVisibility(false);
      } else {
        this.parent.parent.bottomPanelVisibility(this.parent.parent.bottomPanelVisible);
      }
    },

    bindEvents: function() {
      var _this = this,
      firstCanvasId = _this.parent.imagesList[0]['@id'],
      lastCanvasId = _this.parent.imagesList[_this.parent.imagesList.length-1]['@id'];

      this.parent.element.find('.mirador-osd-next').on('click', function() {
        _this.parent.next();
      });

      this.parent.element.find('.mirador-osd-previous').on('click', function() {
        _this.parent.previous();
      });

      this.parent.element.find('.mirador-osd-annotations-layer').on('click', function() {
        if (_this.annoState.current === 'annoOff') {
          _this.annoState.displayOn(this);
        } else {
          _this.annoState.displayOff(this);
        }
      });

      this.parent.element.find('.mirador-osd-go-home').on('click', function() {
        _this.parent.osd.viewport.goHome();
      });

      this.parent.element.find('.mirador-osd-up').on('click', function() {
        var osd = _this.parent.osd;
        osd.viewport.panBy(new OpenSeadragon.Point(0, -0.05));
        osd.viewport.applyConstraints();
      });
      this.parent.element.find('.mirador-osd-right').on('click', function() {
        var osd = _this.parent.osd;
        osd.viewport.panBy(new OpenSeadragon.Point(0.05, 0));
        osd.viewport.applyConstraints();
      });
      this.parent.element.find('.mirador-osd-down').on('click', function() {
        var osd = _this.parent.osd;
        osd.viewport.panBy(new OpenSeadragon.Point(0, 0.05));
        osd.viewport.applyConstraints();
      });
      this.parent.element.find('.mirador-osd-left').on('click', function() {
        var osd = _this.parent.osd;
        osd.viewport.panBy(new OpenSeadragon.Point(-0.05, 0));
        osd.viewport.applyConstraints();
      });
      this.parent.element.find('.mirador-osd-zoom-in').on('click', function() {
        var osd = _this.parent.osd;
        if ( osd.viewport ) {
          osd.viewport.zoomBy(
            osd.zoomPerClick / 1.0
          );
          osd.viewport.applyConstraints();
        }
      });
      this.parent.element.find('.mirador-osd-zoom-out').on('click', function() {
        var osd = _this.parent.osd;
        if ( osd.viewport ) {
          osd.viewport.zoomBy(
            1.0 / osd.zoomPerClick
          );
          osd.viewport.applyConstraints();
        }
      });

      this.parent.element.find('.mirador-osd-fullscreen').on('click', function() {
        if (OpenSeadragon.isFullScreen()) {
          OpenSeadragon.exitFullScreen();
        } else {
          OpenSeadragon.requestFullScreen(_this.parent.parent.element[0]);
        }
      });

      jQuery(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function() {
        _this.fullScreen();
      });

      this.parent.element.find('.mirador-osd-toggle-bottom-panel').on('click', function() {
        var visible = !_this.parent.parent.bottomPanelVisible;
        _this.parent.parent.bottomPanelVisibility(visible);
      });

      jQuery.subscribe('bottomPanelSet.' + _this.windowId, function(event, visible) {
        var dodgers = _this.parent.element.find('.mirador-osd-toggle-bottom-panel, .mirador-pan-zoom-controls, .mirador-osd-annotations-layer');
        var arrows = _this.parent.element.find('.mirador-osd-next, .mirador-osd-previous');
        if (visible === true) {
          dodgers.css({transform: 'translateY(-75px)'});
          arrows.css({transform: 'translateY(-65px)'});
        } else {
          dodgers.css({transform: 'translateY(0)'});
          arrows.css({transform: 'translateY(0)'});
        }
      });

      jQuery.subscribe('currentCanvasIDUpdated.' + _this.windowId, function(event, canvasId) {
        // console.log(canvasId);
        // console.log(lastCanvasId);
        // If it is the first canvas, hide the "go to previous" button, otherwise show it.
        if (canvasId === firstCanvasId) {
          _this.parent.element.find('.mirador-osd-previous').hide();
          _this.parent.element.find('.mirador-osd-next').show();
        } else if (canvasId === lastCanvasId) {
          _this.parent.element.find('.mirador-osd-next').hide();
          _this.parent.element.find('.mirador-osd-previous').show();
        } else {
          _this.parent.element.find('.mirador-osd-next').show();
          _this.parent.element.find('.mirador-osd-previous').show();
        }
        // If it is the last canvas, hide the "go to previous" button, otherwise show it.
      });
    },

    createStateMachine: function() {
      //add more to these as AnnoState becomes more complex
      var _this = this;
      this.annoState = StateMachine.create({
        initial: 'annoOff',
        events: [
          { name: 'displayOn',  from: 'annoOff',  to: 'annoOnEditOff' },
          { name: 'editOn', from: 'annoOnEditOff', to: 'annoOnEditOn' },
          { name: 'editOff',  from: 'annoOnEditOn',    to: 'annoOnEditOff' },
          { name: 'displayOff', from: ['annoOnEditOn','annoOnEditOff'], to: 'annoOff' }
        ],
        callbacks: {
          ondisplayOn: function(event, from, to) {
            _this.parent.element.find('.mirador-osd-annotations-layer').addClass("selected");
            if (_this.annoEndpointAvailable) {
              _this.contextControls.show();
            }
            jQuery.publish('modeChange.' + _this.windowId, 'displayAnnotations');
          },
          oneditOn: function(event, from, to) {
            _this.parent.element.find('.mirador-osd-edit-mode').addClass("selected");
            jQuery.publish('modeChange.' + _this.windowId, 'editingAnnotations');
            if (_this.annoEndpointAvailable) {
              _this.contextControls.rectTool.enterEditMode();
            }
          },
          oneditOff: function(event, from, to) {
            _this.parent.element.find('.mirador-osd-edit-mode').removeClass("selected");
            jQuery.publish('modeChange.' + _this.windowId, 'displayAnnotations');
            if (_this.annoEndpointAvailable) {
              _this.contextControls.rectTool.exitEditMode();
            }
          },
          ondisplayOff: function(event, from, to) {
            if (_this.annoEndpointAvailable && _this.contextControls.rectTool) {
              _this.contextControls.rectTool.exitEditMode();
            }
            _this.parent.element.find('.mirador-osd-edit-mode').removeClass("selected");
            _this.parent.element.find('.mirador-osd-annotations-layer').removeClass("selected");
            if (_this.annoEndpointAvailable) {
              _this.contextControls.hide();
            }
            jQuery.publish('modeChange.' + _this.windowId, 'default');
          }
        }
      });
    },

    fullScreen: function() {
      var replacementButton,
      bottomPanelHeight = this.parent.parent.element.find('.bottomPanel').innerHeight();

      if (!OpenSeadragon.isFullScreen()) {
        replacementButton = jQuery('<i class="fas fa-expand"></i>');
        this.parent.element.find('.mirador-osd-fullscreen').empty().append(replacementButton);
        this.parent.element.find('.mirador-osd-toggle-bottom-panel').show();
        this.parent.parent.bottomPanelVisibility(true);
      } else {

        replacementButton = jQuery('<i class="fas fa-compress"></i>');
        this.parent.element.find('.mirador-osd-fullscreen').empty().append(replacementButton);
        this.parent.element.find('.mirador-osd-toggle-bottom-panel').hide();
        this.parent.parent.bottomPanelVisibility(false);
      }
    },

    template: Handlebars.compile([
                                 '{{#if showNextPrev}}',
                                 '<a class="mirador-osd-previous hud-control ">',
                                 '<i class="fas fa-3x fa-chevron-left "></i>',
                                 '</a>',
                                 '{{/if}}',
                                 '<a class="mirador-osd-fullscreen hud-control">',
                                 '<i class="fas fa-expand"></i>',
                                 '</a>',
                                 '{{#if showAnno}}',
                                 '<a class="mirador-osd-annotations-layer hud-control ">',
                                 '<i class="fas fa-2x fa-comments"></i>',
                                 '</a>',
                                 '{{/if}}',
                                 '{{#if showNextPrev}}',
                                 '<a class="mirador-osd-next hud-control ">',
                                 '<i class="fas fa-3x fa-chevron-right"></i>',
                                 '</a>',
                                 '{{/if}}',
                                 '{{#if showBottomPanel}}',
                                 '<a class="mirador-osd-toggle-bottom-panel hud-control ">',
                                 '<i class="fas fa-2x fa-ellipsis-h"></i>',
                                 '</a>',
                                 '{{/if}}',
                                 '<div class="mirador-pan-zoom-controls hud-control ">',
                                 '<a class="mirador-osd-up hud-control">',
                                 '<i class="fas fa-chevron-circle-up"></i>',
                                 '</a>',
                                 '<a class="mirador-osd-right hud-control">',
                                 '<i class="fas fa-chevron-circle-right"></i>',
                                 '</a>',
                                 '<a class="mirador-osd-down hud-control">',
                                 '<i class="fas fa-chevron-circle-down"></i>',
                                 '</a>',
                                 '<a class="mirador-osd-left hud-control">',
                                 '<i class="fas fa-chevron-circle-left"></i>',
                                 '</a>',
                                 '<a class="mirador-osd-zoom-in hud-control">',
                                 '<i class="fas fa-plus-circle"></i>',
                                 '</a>',
                                 '<a class="mirador-osd-zoom-out hud-control">',
                                 '<i class="fas fa-minus-circle"></i>',
                                 '</a>',
                                 '<a class="mirador-osd-go-home hud-control">',
                                 '<i class="fas fa-home"></i>',
                                 '</a>',
                                 '</div>'
    ].join(''))

  };

}(Mirador));

(function($) {

  $.ImageView = function(options) {

    jQuery.extend(this, {
      currentImg:       null,
      windowId:         null,
      currentImgIndex:  0,
      canvasID:          null,
      imagesList:       [],
      element:          null,
      elemOsd:          null,
      parent:           null,
      manifest:         null,
      osd:              null,
      fullscreen:       null,
      osdOptions: {
        osdBounds:        null,
        zoomLevel:        null
      },
      osdCls: 'mirador-osd',
      elemAnno:         null,
      annoCls:          'annotation-canvas',
      annotationLayerAvailable: null
    }, options);

    this.init();
  };

  $.ImageView.prototype = {

    init: function() {
      // check (for thumbnail view) if the canvasID is set.
      // If not, make it page/item 1.
      if (this.canvasID !== null) {
        this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      }

      if (!this.osdOptions) {
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
      }
      this.currentImg = this.imagesList[this.currentImgIndex];
      this.element = jQuery(this.template()).appendTo(this.appendTo);
      this.elemAnno = jQuery('<div/>')
      .addClass(this.annoCls)
      .appendTo(this.element);
      this.createOpenSeadragonInstance($.Iiif.getImageUrl(this.currentImg));
      this.parent.updateFocusImages([this.canvasID]);
      // The hud controls are consistent
      // throughout any updates to the osd canvas.
      this.hud = new $.Hud({
        parent: this,
        element: this.element,
        bottomPanelAvailable: this.bottomPanelAvailable,
        windowId: this.windowId,
        annotationLayerAvailable: this.annotationLayerAvailable,
        annoEndpointAvailable: this.annoEndpointAvailable
      });
    },

    template: Handlebars.compile([
                                 '<div class="image-view">',
                                 '</div>'
    ].join('')),

    setBounds: function() {
      var _this = this;
      this.osdOptions.osdBounds = this.osd.viewport.getBounds(true);
      jQuery.publish("imageBoundsUpdated", {
        id: _this.parent.id,
        osdBounds: {
          x: _this.osdOptions.osdBounds.x,
          y: _this.osdOptions.osdBounds.y,
          width: _this.osdOptions.osdBounds.width,
          height: _this.osdOptions.osdBounds.height
        }
      });
    },

    toggle: function(stateValue) {
      if (stateValue) {
        this.show();
      } else {
        this.hide();
      }
    },

    hide: function() {
      jQuery(this.element).hide({effect: "fade", duration: 1000, easing: "easeOutCubic"});
    },

    show: function() {
      jQuery(this.element).show({effect: "fade", duration: 1000, easing: "easeInCubic"});
    },

    adjustWidth: function(className, hasClass) {
      if (hasClass) {
        this.parent.element.find('.view-container').removeClass(className);
      } else {
        this.parent.element.find('.view-container').addClass(className);
      }
    },

    adjustHeight: function(className, hasClass) {
      if (hasClass) {
        this.element.removeClass(className);
      } else {
        this.element.addClass(className);
      }
    },

    createOpenSeadragonInstance: function(imageUrl) {
      var infoJsonUrl = imageUrl + '/info.json',
      uniqueID = $.genUUID(),
      osdID = 'mirador-osd-' + uniqueID,
      infoJson,
      _this = this;

      this.element.find('.' + this.osdCls).remove();

      jQuery.getJSON(infoJsonUrl).done(function (infoJson, status, jqXHR) {
        _this.elemOsd =
          jQuery('<div/>')
        .addClass(_this.osdCls)
        .attr('id', osdID)
        .appendTo(_this.element);

        _this.osd = $.OpenSeadragon({
          'id':           osdID,
          'tileSources':  infoJson,
          'uniqueID' : uniqueID
        });

        _this.osd.addHandler('open', function(){
          if (_this.osdOptions.osdBounds) {
            var rect = new OpenSeadragon.Rect(_this.osdOptions.osdBounds.x, _this.osdOptions.osdBounds.y, _this.osdOptions.osdBounds.width, _this.osdOptions.osdBounds.height);
            _this.osd.viewport.fitBounds(rect, true);
          }

          _this.addAnnotationsLayer(_this.elemAnno);
          //re-add correct annotationsLayer mode based on annoState
          if (_this.hud.annoState.current !== "annoOff") {
            jQuery.publish('modeChange.' + _this.windowId, 'displayAnnotations');
          }

          // A hack. Pop the osd overlays layer after the canvas so
          // that annotations appear.
          jQuery(_this.osd.canvas).children().first().remove().appendTo(_this.osd.canvas);

          _this.osd.addHandler('zoom', $.debounce(function() {
            _this.setBounds();
          }, 500));

          _this.osd.addHandler('pan', $.debounce(function(){
            _this.setBounds();
          }, 500));

        });
      });
    },

    addAnnotationsLayer: function(element) {
      var _this = this;
      _this.annotationsLayer = new $.AnnotationsLayer({
        parent: _this,
        annotationsList: _this.parent.annotationsList || [],
        viewer: _this.osd,
        windowId: _this.windowId,
        element: element
      });

    },

    updateImage: function(canvasID) {
      if (this.canvasID !== canvasID) {
        this.canvasID = canvasID;
        this.currentImgIndex = $.getImageIndexById(this.imagesList, canvasID);
        this.currentImg = this.imagesList[this.currentImgIndex];
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
        this.osd.close();
        this.createOpenSeadragonInstance($.Iiif.getImageUrl(this.currentImg));
        this.parent.updateFocusImages([canvasID]);
        //by default, don't allow a user to be in edit annotation mode when changing pages
        if (this.hud.annoState.current === "annoOnEditOn") {
          this.hud.annoState.editOff();
        }
      } else {
        this.parent.updateFocusImages([canvasID]);
      }
    },

    next: function() {
      var next = this.currentImgIndex + 1;

      if (next < this.imagesList.length) {
        this.parent.setCurrentCanvasID(this.imagesList[next]['@id']);
      }
    },

    previous: function() {
      var prev = this.currentImgIndex - 1;

      if (prev >= 0) {
        this.parent.setCurrentCanvasID(this.imagesList[prev]['@id']);
      }
    }
  };

}(Mirador));

(function($) {

  $.MetadataView = function(options) {

    jQuery.extend(this, {
      manifest:             null,
      element:              null,
      parent:               null,
      metadataTypes:        null,
      metadataListingCls:   'metadata-listing'
    }, options);

    this.init();
  };


  $.MetadataView.prototype = {

    init: function() {
      var _this = this,
          tplData = {
            metadataListingCls: this.metadataListingCls
          };

      _this.manifest = _this.manifest.jsonLd;
      this.metadataTypes = {};

      this.metadataTypes.details = _this.getMetadataDetails(_this.manifest);
      this.metadataTypes.rights = _this.getMetadataRights(_this.manifest);
      this.metadataTypes.links = _this.getMetadataLinks(_this.manifest);
      this.metadataTypes.relatedLinks = _this.getMetadataRelatedLinks(_this.manifest);

      //vvvvv This is *not* how this should be done.
      jQuery.each(this.metadataTypes, function(metadataKey, metadataValue) {
        tplData[metadataKey] = [];

        jQuery.each(metadataValue, function(key, value) {
          if (typeof value === 'object') {
            value = _this.stringifyObject(value);
          }

          if (typeof value === 'string' && value !== '') {
            tplData[metadataKey].push({
              label: _this.extractLabelFromAttribute(key),
              value: _this.addLinksToUris(value)
            });
          }
        });
      });

      this.element = jQuery(this.template(tplData)).appendTo(this.appendTo);
      this.bindEvents();
    },

  // Base code from https://github.com/padolsey/prettyprint.js. Modified to fit Mirador needs
  stringifyObject: function(obj, nestingMargin) {
    var type = typeof obj,
        _this = this,
        str,
        first = true,
        increment = 15,
        delimiter = '<br/>';

    if (obj instanceof RegExp) {
      return '/' + obj.source + '/';
    }

    if (typeof nestingMargin === 'undefined') {
      nestingMargin = 0;
    }

    if (obj instanceof Array) {
      str = '[ ';
      jQuery.each(obj, function (i, item) {
        str += (i === 0 ? '' : ', ') + _this.stringifyObject(item, nestingMargin + increment);
      });
      return str + ' ]';
    }

    if (typeof obj === 'object') {
      str = '<div style="margin-left:' +  nestingMargin + 'px">';
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          str += (first ? '' : delimiter) + i + ': ' + _this.stringifyObject(obj[i], nestingMargin + increment);
          first = false;
        }
      }

      return str + '</div>';
    }
    return obj.toString();
  },


  getMetadataDetails: function(jsonLd) {
      var mdList = {
          'label':        '<b>' + jsonLd.label + '</b>' || '',
          'description':  jsonLd.description || ''
      };
      if (typeof mdList.description == "object") {
        var value = "";
        jQuery.each(mdList.description, function(index, item) {
          if (typeof item == "string") {
            value += item;
            value += "<br/>";
          } else {
            // {@value: ..., @language: ...}
            if (item['@language'] == "en") {
              value += item['@value'];
              value += "<br/>";
            }
          }
        });
        mdList.description = value;
      }

      if (jsonLd.metadata) {
        jQuery.each(jsonLd.metadata, function(index, item) {
          var value = "";
          if (typeof item.value == "object") {
            value = "";
            jQuery.each(item.value, function(i2, what) {
              if (typeof what == "string") {
                value += what;
                value += "<br/>";
              } else {
                // {@value: ..., @language: ...}
                if (what['@language'] == "en") {
                  value += what['@value'];
                  value += "<br/>";
                }
              }
            });
          } else {
            value = item.value;
          }
          mdList[item.label] = value;
        });
      }
      return mdList;
    },

   getMetadataRights: function(jsonLd) {
       return {
           'license':      jsonLd.license || '',
           'attribution':  jsonLd.attribution || '',
           'logo': jsonLd.logo || ''
        };
   },

   getMetadataLinks: function(jsonLd) {
     // #414
      return {
          'related': jsonLd.related || '',
          'seeAlso': jsonLd.seeAlso || '',
          'within':  jsonLd.within || ''
        };
   },

   getMetadataRelatedLinks: function(jsonLd) {
      return {
          'related': jsonLd.related || ''
        };
   },

   extractLabelFromAttribute: function(attr) {
    var label = attr;

    label = label.replace(/^@/, '');
    label = label.replace(/([A-Z])/g, ' $1');
    label = label.replace(/\s{2,}/g, ' ');
    label = label.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return label;
  },

    bindEvents: function() {
    },

    toggle: function(stateValue) {
        if (stateValue) {
            this.show();
        } else {
            this.hide();
        }
    },

    show: function() {
        var element = jQuery(this.element);
        if (this.panel) {
            element = element.parent();
        }
        element.show({effect: "slide", direction: "right", duration: 300, easing: "swing"});
    },

    hide: function() {
        var element = jQuery(this.element);
        if (this.panel) {
            element = element.parent();
        }
        element.hide({effect: "slide", direction: "right", duration: 300, easing: "swing"});
    },

    addLinksToUris: function(text) {
      // http://stackoverflow.com/questions/8188645/javascript-regex-to-match-a-url-in-a-field-of-text
      var regexUrl = /(http|ftp|https):\/\/[\w\-]+(\.[\w\-]+)+([\w.,@?\^=%&amp;:\/~+#\-]*[\w@?\^=%&amp;\/~+#\-])?/gi,
          textWithLinks = text,
          matches;

      if (typeof text === 'string') {
        matches = text.match(regexUrl);

        if (matches) {
          jQuery.each(matches, function(index, match) {
            textWithLinks = textWithLinks.replace(match, '<a href="' + match + '" target="_blank">' + match + '</a>');
          });
        }
      }

      return textWithLinks;
    },

    template: Handlebars.compile([
    '<div class="sub-title">Details:</div>',
        '<dl class="{{metadataListingCls}}">',
          '{{#each details}}',
            '<dt>{{label}}:</dt><dd>{{{value}}}</dd>',
          '{{/each}}',
        '</dl>',
        '<div class="sub-title">Rights:</div>',
        '{{#if rights}}',
        '<dl class="{{metadataListingCls}}">',
          '{{#each rights}}',
            '<dt>{{label}}:</dt><dd>{{{value}}}</dd>',
          '{{/each}}',
        '</dl>',
        '{{else}}',
        '<dl class="{{metadataListingCls}}">',
            '<dt>Rights Status:</dt><dd>Unspecified</dd>',
        '</dl>',
        '{{/if}}',
        '{{#if links}}',
        '<div class="sub-title">Links:</div>',
        '<dl class="{{metadataListingCls}}">',
          '{{#each links}}',
            '<dt>{{label}}:</dt><dd>{{{value}}}</dd>',
          '{{/each}}',
          // '{{#if relatedLinks}}',
          //   '<dt>{{label}}:</dt><dd>{{{value}}}</dd>',
          // '{{/if}}',
        '</dl>',
        '{{/if}}'

    ].join(''), { noEscape: true })

  };

}(Mirador));

(function($) {

  $.WidgetScale = function(options) {

     jQuery.extend(true, this, {

     }, $.DEFAULT_SETTINGS, options);

  };

  $.WidgetScale.prototype = {

  };

}(Mirador));


(function($) {

  $.ScrollView = function(options) {

    jQuery.extend(this, {
      currentImgIndex:      0,
      canvasID:              null,
      focusImages:          [],
      manifest:             null,
      element:              null,
      imagesList:           [],
      appendTo:             null,
      thumbInfo:            {thumbsHeight: 150, listingCssCls: 'listing-thumbs', thumbnailCls: 'thumbnail-view'},
      parent:               null,
      panel:                false,
      lazyLoadingFactor:    1.5  //should be >= 1
    }, options);

    jQuery.extend($.ScrollView.prototype, $.ThumbnailsView.prototype);
    this.init();
  };

}(Mirador));

(function($) {

  $.WidgetStatusBar = function(options) {

     jQuery.extend(true, this, {

     }, $.DEFAULT_SETTINGS, options);

  };

  $.WidgetStatusBar.prototype = {

  };

}(Mirador));


(function($) {

  $.ThumbnailsView = function(options) {

    jQuery.extend(this, {
      currentImgIndex:      0,
      canvasID:              null,
      focusImages:          [],
      manifest:             null,
      element:              null,
      imagesList:           [],
      appendTo:             null,
      thumbInfo:            {thumbsHeight: 150, listingCssCls: 'listing-thumbs', thumbnailCls: 'thumbnail-view'},
      defaultThumbHeight:   150,
      parent:               null,
      panel:                false,
      lazyLoadingFactor:    1.5  //should be >= 1
    }, options);

    this.init();
  };


  $.ThumbnailsView.prototype = {

    init: function() {
      if (this.canvasID !== null) {
        this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      }

      this.loadContent();
      this.bindEvents();
    },

    loadContent: function() {
      var _this = this,
      tplData = {
        defaultHeight:  this.thumbInfo.thumbsHeight,
        listingCssCls:  this.thumbInfo.listingCssCls,
        thumbnailCls:   this.thumbInfo.thumbnailCls
      };

      tplData.thumbs = jQuery.map(this.imagesList, function(canvas, index) {
        if (canvas.width === 0) {
          return {};
        }

        var aspectRatio = canvas.height/canvas.width,
        width = (_this.thumbInfo.thumbsHeight/aspectRatio),
        thumbnailUrl = $.getThumbnailForCanvas(canvas, width);

        return {
          thumbUrl: thumbnailUrl,
          title:    canvas.label,
          id:       canvas['@id'],
          width:    width,
          highlight: _this.currentImgIndex === index ? 'highlight' : ''
        };
      });

      this.element = jQuery(_this.template(tplData)).appendTo(this.appendTo);
    },

    updateImage: function(canvasId) {
      this.currentImgIndex = $.getImageIndexById(this.imagesList, canvasId);
      this.element.find('.highlight').removeClass('highlight');
      this.element.find("img[data-image-id='"+canvasId+"']").addClass('highlight');
      this.element.find("img[data-image-id='"+canvasId+"']").parent().addClass('highlight');
    },

    updateFocusImages: function(focusList) {
      var _this = this;
      this.element.find('.highlight').removeClass('highlight');
      jQuery.each(focusList, function(index, canvasId) {
        _this.element.find("img[data-image-id='"+canvasId+"']").addClass('highlight');
        _this.element.find("img[data-image-id='"+canvasId+"']").parent().addClass('highlight');
      });
    },

    currentImageChanged: function() {
      var _this = this,
      target = _this.element.find('.highlight'),
      scrollPosition;

      if (this.parent.currentFocus === 'BookView') {
        scrollPosition = _this.element.scrollLeft() + (target.position().left + (target.next().width() + target.outerWidth())/2) - _this.element.width()/2;
      } else {

        scrollPosition = _this.element.scrollLeft() + (target.position().left + target.width()/2) - _this.element.width()/2;
      }
      _this.element.scrollTo(scrollPosition, 900);
    },

    bindEvents: function() {
      var _this = this;
      _this.element.find('img').on('load', function() {
        jQuery(this).hide().fadeIn(750);
      });

      jQuery(_this.element).scroll(function() {
        _this.loadImages();
      });

      jQuery.subscribe('windowResize', $.debounce(function(){
        _this.loadImages();
      }, 100));

      //add any other events that would trigger thumbnail display (resize, etc)

      _this.element.find('.thumbnail-image').on('click', function() {
        var canvasID = jQuery(this).attr('data-image-id');
        _this.parent.setCurrentCanvasID(canvasID);
      });

      jQuery.subscribe(('currentCanvasIDUpdated.' + _this.parent.id), function(canvasId) {
        _this.currentImageChanged();
      });
    },

    toggle: function(stateValue) {
      if (stateValue) {
        this.show();
      } else {
        this.hide();
      }
    },

    loadImages: function() {
      var _this = this;
      jQuery.each(_this.element.find("img"), function(key, value) {
        if ($.isOnScreen(value, _this.lazyLoadingFactor) && !jQuery(value).attr("src")) {
          var url = jQuery(value).attr("data");
          _this.loadImage(value, url);
        }
      });
    },

    loadImage: function(imageElement, url) {
      var _this = this,
      imagePromise = $.createImagePromise(url);

      imagePromise.done(function(image) {
        jQuery(imageElement).attr('src', image);
      });
    },

    reloadImages: function(newThumbHeight, triggerShow) {
      var _this = this;
      this.thumbInfo.thumbsHeight = newThumbHeight;

      jQuery.each(this.imagesList, function(index, image) {
        var aspectRatio = image.height/image.width,
        width = (_this.thumbInfo.thumbsHeight/aspectRatio),
        newThumbURL = $.getThumbnailForCanvas(image, width),
        id = image['@id'];
        var imageElement = _this.element.find('img[data-image-id="'+id+'"]');
        imageElement.attr('data', newThumbURL).attr('height', _this.thumbInfo.thumbsHeight).attr('width', width).attr('src', '');
      });
      if (triggerShow) {
        this.show();
      }
    },

    template: Handlebars.compile([
                                 '<div class="{{thumbnailCls}}">',
                                 '<ul class="{{listingCssCls}}">',
                                 '{{#thumbs}}',
                                 '<li class="{{highlight}}">',
                                 '<img class="thumbnail-image {{highlight}}" title="{{title}}" data-image-id="{{id}}" src="{{thumbUrl}}" data="{{thumbUrl}}" height="{{../defaultHeight}}" width="{{width}}">',
                                 '<div class="thumb-label">{{title}}</div>',
                                 '</li>',
                                 '{{/thumbs}}',
                                 '</ul>',
                                 '</div>'
    ].join('')),

    hide: function() {
      var element = jQuery(this.element);
      if (this.panel) {
        element = element.parent();
      }
      element.hide({effect: "fade", duration: 300, easing: "easeOutCubic"});
    },

    show: function() {
      var element = jQuery(this.element);
      if (this.panel) {
        element = element.parent();
      }
      var _this = this;
      element.show({
        effect: "fade",
        duration: 300,
        easing: "easeInCubic",
        complete: function() {
          _this.loadImages();
        }
      });
    },

    adjustWidth: function(className, hasClass) {
      if (hasClass) {
        this.parent.element.find('.view-container').removeClass(className);
      } else {
        this.parent.element.find('.view-container').addClass(className);
      }
    },

    adjustHeight: function(className, hasClass) {
      if (hasClass) {
        this.element.removeClass(className);
      } else {
        this.element.addClass(className);
      }
    }

  };



}(Mirador));

(function($) {

  $.TableOfContents = function(options) {

    jQuery.extend(true, this, {
      element:           null,
      appendTo:          null,
      parent:            null,
      manifest:          null,
      structures:        null,
      previousSelectedElements: [],
      selectedElements: [],
      openElements:     [],
      hoveredElement:   [],
      selectContext:    null,
      tocData: {},
      active: null
    }, options);

    this.init();

  };

  $.TableOfContents.prototype = {
    init: function () {
      var _this = this;
      _this.structures = _this.manifest.getStructures();
      if (!_this.structures || _this.structures.length === 0) {
        _this.hide();
        _this.parent.setTOCBoolean(false);
        return;
      } else {
        _this.parent.setTOCBoolean(true);
        this.ranges = this.setRanges();
        this.element = jQuery(this.template({ ranges: this.getTplData() })).appendTo(this.appendTo);
        this.tocData = this.initTocData();
        this.selectedElements = $.getRangeIDByCanvasID(_this.structures, _this.parent.currentCanvasID);
        this.element.find('.has-child ul').hide();
        this.render();
        this.bindEvents();
      }
    },

    setRanges: function() {
      var _this = this,
      ranges = [];
      jQuery.each(_this.structures, function(index, range) {
        if (range['@type'] === 'sc:Range') {
          ranges.push({
            id: range['@id'],
            canvases: range.canvases,
            within: range.within,
            label: range.label
          });
        }
      });

      return ranges;

    },

    getTplData: function() {
      var _this = this,
      ranges = _this.extractRangeTrees(_this.ranges);

      if (ranges.length < 2) {
        ranges = ranges[0].children;
      }

      return ranges;
    },

    initTocData: function() {
      var _this = this,
      tocData = {};

      jQuery.each(_this.ranges, function(index, item) {
        var rangeID = item.id,
        attrString = '[data-rangeid="' + rangeID +'"]';

        tocData[item.id] = {
          element: _this.element.find(attrString).closest('li') //,
          // open: false,
          // selected: false,
          // hovered: false
        };
      });

      return tocData;
    },

    extractRangeTrees: function(rangeList) {
      var tree, parent;
      // Recursively build tree/table of contents data structure
      // Begins with the list of topmost categories
      function unflatten(flatRanges, parent, tree) {
        // To aid recursion, define the tree if it does not exist,
        // but use the tree that is being recursively built
        // by the call below.
        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : {id: "root", label: "Table of Contents" };
        var children = jQuery.grep(flatRanges, function(child) { if (!child.within) { child.within = 'root'; } return child.within == parent.id; });
        if ( children.length ) {
          if ( parent.id === 'root') {
            // If there are children and their parent's
            // id is a root, bind them to the tree object.
            //
            // This begins the construction of the object,
            // and all non-top-level children are now
            // bound the these base nodes set on the tree
            // object.
            children.forEach(function(child) {
              child.level = 0;
            });
            tree = children;
          } else {
            // If the parent does not have a top-level id,
            // bind the children to the parent node in this
            // recursion level before handing it over for
            // another spin.
            //
            // Because "child" is passed as
            // the second parameter in the next call,
            // in the next iteration "parent" will be the
            // first child bound here.
            children.forEach(function(child) {
              child.level = parent.level+1;
            });
            parent.children = children;
          }
          // The function cannot continue to the return
          // statement until this line stops being called,
          // which only happens when "children" is empty.
          jQuery.each( children, function( index, child ){ unflatten( flatRanges, child ); } );
        }
        return tree;
      }

      return unflatten(rangeList);
    },

    render: function() {
      var _this = this,
      toDeselect = jQuery.map(_this.previousSelectedElements, function(rangeID) {
            return _this.tocData[rangeID].element.toArray();
      }),
      toSelect = jQuery.map(_this.selectedElements, function(rangeID) {
            return _this.tocData[rangeID].element.toArray();
      }),
      toOpen = jQuery.map(_this.selectedElements, function(rangeID) {
          if ((jQuery.inArray(rangeID, _this.openElements) < 0) && (jQuery.inArray(rangeID, _this.previousSelectedElements) < 0)) {
            return _this.tocData[rangeID].element.toArray();
          }
      }),
      toClose = jQuery.map(_this.previousSelectedElements, function(rangeID) {
          if ((jQuery.inArray(rangeID, _this.openElements) < 0) && (jQuery.inArray(rangeID, _this.selectedElements) < 0)) {
            return _this.tocData[rangeID].element.toArray();
          }
      });

      // Deselect elements
      jQuery(toDeselect).removeClass('selected');

      // Select new elements
      jQuery(toSelect).addClass('selected');

      // Scroll to new elements
      scroll();

      // Open new ones
      jQuery(toOpen).toggleClass('open').find('ul:first').slideFadeToggle();
      // Close old ones (find way to keep scroll position).
      jQuery(toClose).toggleClass('open').find('ul:first').slideFadeToggle(400, 'swing', scroll);

      // Get the sum of the outer height of all elements to be removed.
      // Subtract from current parent height to retreive the new height.
      // Scroll with respect to this.
      scroll();

      function scroll() {
        var head = _this.element.find('.selected').first();
        _this.element.scrollTo(head, 400);
      }

    },

    bindEvents: function() {
      var _this = this;
      // var eventString = _this.parent.id

      jQuery.subscribe('focusChanged', function(_, manifest, focusFrame) {
      });

      jQuery.subscribe('cursorFrameUpdated', function(_, manifest, cursorBounds) {
      });

      jQuery.subscribe(('currentCanvasIDUpdated.' + _this.parent.id), function(event, canvasID) {
        if (!_this.structures) { return; }
        _this.setSelectedElements($.getRangeIDByCanvasID(_this.structures, canvasID));
        _this.render();
      });

      _this.element.find('.toc-link').on('click', function(event) {
        event.stopPropagation();
        // The purpose of the immediate event is to update the data on the parent
        // by calling its "set" function.
        //
        // The parent (window) then emits an event notifying all panels of
        // the update, so they can respond in their own unique ways
        // without window having to know anything about their DOMs or
        // internal structure.
        var rangeID = jQuery(this).data().rangeid,
        canvasID = jQuery.grep(_this.structures, function(item) { return item['@id'] == rangeID; })[0].canvases[0],
        isLeaf = jQuery(this).closest('li').hasClass('leaf-item');

        // if ( _this.parent.currentFocus === 'ThumbnailsView' & !isLeaf) {
        //   _this.parent.setCursorFrameStart(canvasID);
        // } else {
          _this.parent.setCurrentCanvasID(canvasID);
        // }
      });

      _this.element.find('.caret').on('click', function(event) {
        event.stopPropagation();

        var rangeID = jQuery(this).parent().data().rangeid;
        _this.setOpenItem(rangeID);

        // For now it's alright if this data gets lost in the fray.
        jQuery(this).closest('li').toggleClass('open').find('ul:first').slideFadeToggle();

        // The parent (window) then emits an event notifying all panels of
        // the update, so they can respond in their own unique ways
        // without window having to know anything about their DOMs or
        // internal structure.
      });

      _this.element.on('mouseleave', function() {
        var head = _this.element.find('.selected').first();
        _this.element.stop().delay(1800).scrollTo(head, 1000);
        _this.setActive(false);
      });

      _this.element.on('mouseenter', function() {
        _this.element.stop();
        _this.setActive(true);
      });

    },

    setActive: function(active) {
      var _this = this;
      _this.active = active;
    },

    setOpenItem: function(rangeID) {
      var _this = this;

      if (jQuery.inArray(rangeID, _this.openElements)<0) {
        _this.openElements.push(rangeID);
      } else {
        _this.openElements.splice(jQuery.inArray(rangeID, _this.openElements), 1);
      }
    },

    // focusCursorFrame: function() {
    //   console.log('focusCursorFrame');
    // },

    // hoverItem: function() {
    //   console.log('hoverItem');
    // },

    setSelectedElements: function(rangeIDs) {
      var _this = this;

      _this.previousSelectedElements = _this.selectedElements;
      _this.selectedElements = rangeIDs;
    },

    // returnToPlace: function() {
    //   console.log('returnToPlace');
    // },

    template: function(tplData) {

      var template = Handlebars.compile([
        '<ul class="toc">',
          '{{#nestedRangeLevel ranges}}',
            '<li class="{{#if children}}has-child{{else}}leaf-item{{/if}}"">',
              '{{{tocLevel id label level children}}}',
              '{{#if children}}',
                '<ul>',
                '{{{nestedRangeLevel children}}}',
                '</ul>',
              '{{/if}}',
            '<li>',
          '{{/nestedRangeLevel}}',
        '</ul>'
      ].join(''));

      var previousTemplate;

      Handlebars.registerHelper('nestedRangeLevel', function(children, options) {
        var out = '';

        if (options.fn !== undefined) {
          previousTemplate = options.fn;
        }

        children.forEach(function(child) {
          out = out + previousTemplate(child);
        });

        return out;
      });

      Handlebars.registerHelper('tocLevel', function(id, label, level, children) {
        var caret = '<i class="fa fa-caret-right caret"></i>',
        cert = '<i class="fa fa-certificate star"></i>';
        return '<h' + (level+1) + '><a class="toc-link" data-rangeID="' + id + '">' + caret + cert + '<span class="label">' + label + '</span></a></h' + (level+1) + '>';
      });

      return template(tplData);
    },

    toggle: function(stateValue) {
      if (!this.structures) { stateValue = false; }
      if (stateValue) {
        this.show();
      } else {
        this.hide();
      }
    },

    hide: function() {
      jQuery(this.appendTo).hide();
      this.parent.element.find('.view-container').addClass('focus-max-width');
    },

    show: function() {
      jQuery(this.appendTo).show({effect: "fade", duration: 300, easing: "easeInCubic"});
      this.parent.element.find('.view-container').removeClass('focus-max-width');
    }

  };

}(Mirador));


(function($) {

  $.WidgetViewport = function(options) {

     jQuery.extend(true, this, {

     }, $.DEFAULT_SETTINGS, options);

  };

  $.WidgetViewport.prototype = {

  };

}(Mirador));



(function($) {

  $.Iiif = {

    getImageUrl: function(image) {

      if (!image.images[0].resource.service) {
        id = image.images[0].resource['default'].service['@id'];
        id = id.replace(/\/$/, "");
        return id;
      }

      var id = image.images[0].resource.service['@id'];
      id = id.replace(/\/$/, "");

      return id;
    },

    getVersionFromContext: function(context) {
      if (context == "http://iiif.io/api/image/2/context.json") {
        return "2.0";
      } else {
        return "1.1";
      }
    },

    makeUriWithWidth: function(uri, width, version) {
      uri = uri.replace(/\/$/, '');
      if (version[0] == '1') {
        return uri + '/full/' + width + ',/0/native.jpg';
      } else {
        return uri + '/full/' + width + ',/0/default.jpg';
      }
    },

    getImageHostUrl: function(json) {
      var regex,
          matches = [];

      if (!json.hasOwnProperty('image_host')) {

        json.image_host = json.tilesUrl || json['@id'] || '';

       if (json.hasOwnProperty('identifier')) {
          regex = new RegExp('/?' + json.identifier + '/?$', 'i');
          json.image_host = json.image_host.replace(regex, '');

        } else {
          regex = new RegExp('(.*)\/(.*)$');
          matches = regex.exec(json.image_host);

          if (matches.length > 1) {
            json.image_host = matches[1];
            json.identifier = matches[2];
          }
        }
      }

      return json.image_host;
    }

  };

}(Mirador));


// for scroll view
// source: http://stackoverflow.com/questions/14035083/jquery-bind-event-on-scroll-stops
jQuery.fn.scrollStop = function(callback) {
  $(this).scroll(function() {
    var self  = this,
    $this = $(self);

    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }

    $this.data('scrollTimeout', setTimeout(callback, 250, self));
  });
};


// for resize events
// source: https://github.com/f/jquery.resizestop
(function($) {
  var slice = Array.prototype.slice;

  // Special event definition
  $.extend($.event.special, {
    resizestop: {
      add: function(handle) {
        var handler = handle.handler;

        $(this).resize(function(e) {
          clearTimeout(handler._timer);
          e.type = 'resizestop';

          var _proxy = $.proxy(handler, this, e);
          handler._timer = setTimeout(_proxy, handle.data || 200);
        });
      }
    },

    resizestart: {
      add: function(handle) {
        var handler = handle.handler;

        $(this).on('resize', function(e) {
          clearTimeout(handler._timer);

          if (!handler._started) {
            e.type = 'resizestart';
            handler.apply(this, arguments);
            handler._started = true;
          }

          handler._timer = setTimeout($.proxy(function() {
            handler._started = false;
          }, this), handle.data || 300);
        });
      }
    }
  });

  // binding and currying the shortcuts.
  $.extend($.fn, {
    resizestop: function() {
      $(this).on.apply(this, ["resizestop"].concat(slice.call(arguments)));
    },
    resizestart: function() {
      $(this).on.apply(this, ["resizestart"].concat(slice.call(arguments)));
    }
  });
})(jQuery);
(function($) {

  $.OaAnnotation = function(options) {

    jQuery.extend(this, {
      text: null,
      tags: null,
      bounds: null, // the "frame" or "cnotext" bounds, in canvas coordinates
      regionFragment: null,
      id: null, // the oa (canvas) @id under which to save it, preferably a uri.
      oaAnnotation: null
    }, options);

    this.init();
  };

  $.OaAnnotation.prototype = {

    init: function() {
      this.oaAnnotation = {}; // stub text of valid oa annotation (as
                   // it would appear in an oa:annotationList)
                   // to go here. Properties will be queried and
                   // twiddled by the get/set methods for each
                   // property below (as the annotation is
                   // passed through the annotation creation process).
    },

    chars: function(chars) {
      // getter and setter for text of annotation.
      // If arguments are present, the property
      // is set to the given value. If there are no
      // arguments given, then
      if (!arguments.length) return _this.oa.resource.chars; // not sure if this is the right "path"?
      _this.oa.resource.chars = chars;
      return this; // allow chaining?
    },

    tags: function(tags) {
      if (!arguments.length) return _this.oa.resource.chars; // not sure if this is the right "path"?
      _this.oa.resource.chars = chars;
      return this; // allow chaining?
      // getter and setter for tag field (only the part that can be changed by user).
      // If arguments are present, the property
      // is set to the given value. If there are no
      // arguments given, then
    },

    regionFragment: function() {
      if (!arguments.length) return _this.oa.on; // not sure if this is the right "path"?
      _this.oa.on = chars; // not exactly, parse the "on" field to add the new context after hash.
      return this; // allow chaining?
      // getter and setter for tag field (only the part that can be changed by user).
      // If arguments are present, the property
      // is set to the given value. If there are no
      // arguments given, then
    }
  };
}(Mirador));

(function($) {

  $.OpenSeadragon = function(options) {

    var osd = OpenSeadragon(

      jQuery.extend({
        preserveViewport: true,
        visibilityRatio:  1,
        minZoomLevel:     0,
        defaultZoomLevel: 0,
        blendTime:        0.1,
        alwaysBlend:      false,
        prefixUrl:        'images/openseadragon/',
        showNavigationControl: false
      }, options)

    );

    return osd;

  };

}(Mirador));

(function($) {

  $.SaveController = function(config) {

    jQuery.extend(true, this, {
      currentConfig: null,
      originalConfig: null, // Don't know if we really need this.
      shareEndpoint: null, // the place where POST requests for new saved sessions will go
      historySize: null, // wishful thinking for later.
      sessionID: null
    });

    this.init(jQuery.extend(false, $.DEFAULT_SETTINGS, config));

  };

  $.SaveController.prototype = {

    init: function(config) {
      var _this = this;

      // Don't want to save session, therefore don't set up save controller
      if (config.saveSession === false) {
        this.currentConfig = config;
        return false;
      }

      var sessionID = window.location.hash.substring(1); // will return empty string if none exists, causing the or statement below to evaluate to false, generating a new sesssionID.

      if (sessionID) {
        this.sessionID =  sessionID;
      } else {
        this.sessionID = $.genUUID(); // might want a cleaner thing for the url.
      }

      if (localStorage.getItem(this.sessionID)) {
        this.currentConfig = JSON.parse(localStorage.getItem(sessionID));
      } else {
        var paramURL = window.location.search.substring(1);
        if (paramURL) {
          var params = paramURL.split('=');
          var jsonblob = params[1];
          var ajaxURL = "https://jsonblob.com/api/jsonBlob/"+jsonblob;
          jQuery.ajax({
            type: 'GET',
            url: ajaxURL,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            success: function(data, textStatus, request) {
              _this.currentConfig = data;
            },
            async: false
          });
          //get json from jsonblob and set currentConfig to it
        } else {
          this.currentConfig = config;
        }
      }
      //remove empty hashes from config
      this.currentConfig.windowObjects = jQuery.map(this.currentConfig.windowObjects, function(value, index) {
        if (Object.keys(value).length === 0) return null;
        return value;
      });

      //add UUIDs to parts of config that need them
      if (this.currentConfig.windowObjects) {
        jQuery.each(this.currentConfig.windowObjects, function(index, window) {
          if (!window.id) {
            window.id = $.genUUID();
          }
        });
      }
      // see: http://html5demos.com/history and http://diveintohtml5.info/history.html
      // put history stuff here, for a great cross-browser demo, see: http://browserstate.github.io/history.js/demo/
      //http://stackoverflow.com/questions/17801614/popstate-passing-popped-state-to-event-handler

      //also remove ?json bit so it's a clean URL
      var cleanURL = window.location.href.replace(window.location.search, "");
      if (window.location.hash) {
        history.replaceState(this.currentConfig, "Mirador Session", cleanURL);
      } else {
        history.replaceState(this.currentConfig, "Mirador Session", cleanURL+"#"+this.sessionID);
      }

      this.bindEvents();

    },

    set: function(prop, value, options) {
      // when a property of the config is updated,
      // save it to localStore.
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
      this.save();
      jQuery.publish("saveControllerConfigUpdated");
    },

    bindEvents: function() {
      var _this = this;
      // listen to existing events and use the
      // available data to update the appropriate
      // field in the stored config.

      jQuery.subscribe('windowUpdated', function(event, options) {
        var windowObjects = _this.currentConfig.windowObjects;
        if (windowObjects && windowObjects.length > 0) {
          jQuery.each(windowObjects, function(index, window){
            if (window.id === options.id) {
              jQuery.extend(windowObjects[index], options);
            }
          });
        } else {
          windowObjects = [options];
        }
        _this.set("windowObjects", windowObjects, {parent: "currentConfig"} );
      });

      jQuery.subscribe("imageBoundsUpdated", function(event, options) {
        var windowObjects = _this.currentConfig.windowObjects;
        if (windowObjects && windowObjects.length > 0) {
          jQuery.each(windowObjects, function(index, window){
            if (window.id === options.id) {
              if (!windowObjects[index].windowOptions) {
                windowObjects[index].windowOptions = {};
              }
              windowObjects[index].windowOptions.osdBounds = options.osdBounds;
            }
          });
        }
        _this.set("windowObjects", windowObjects, {parent: "currentConfig"} );
      });

      jQuery.subscribe('manifestQueued', function(event, manifestObject, repository) {
        var data = _this.currentConfig.data,
        objectInConfig = false,
        url = manifestObject.uri;

        jQuery.each(data, function(index, manifestObject){
          if (manifestObject.manifestUri === url) {
            objectInConfig = true;
          }
        });
        if (!objectInConfig) {
          data.push({"manifestUri":url, "location":repository});
          _this.set("data", data, {parent: "currentConfig"});
        }
      });

      jQuery.subscribe("layoutChanged", function(event, layoutDescription) {
        // string parents to prevent invalid circular representation.
        var serialisedLayout = JSON.stringify(layoutDescription, function(key, value) {
          if (key === 'parent') return undefined;
          return value;
        });
        _this.set('layout', serialisedLayout, {parent: "currentConfig"} );
      });

      jQuery.subscribe("windowAdded", function(event, options) {
        var windowObjects = _this.currentConfig.windowObjects,
        inArray = jQuery.grep(windowObjects, function(windowObj) {
          return windowObj.id === options.id;
        });
        if (inArray.length === 0) {
          windowObjects.push({
            'id' : options.id,
            'slotAddress': options.slotAddress
          });
          _this.set("windowObjects", windowObjects, {parent: "currentConfig"} );
        }
      });

        jQuery.subscribe("windowsRemoved", function(event) {
          _this.set("windowObjects", [], {parent: "currentConfig"} );
        });

      jQuery.subscribe("windowRemoved", function(event, windowID) {
        var windowObjects = jQuery.grep(_this.currentConfig.windowObjects, function(window, index) {
          return window.id !== windowID;
        });
        _this.set("windowObjects", windowObjects, {parent: "currentConfig"} );
      });

      jQuery.subscribe('etc...', function(junk) {
        // handle adding the property in the appropriate place
        // in this.currentConfig by passing to the _this.set(),
        // which "saves" to localstore as a side effect.

      });

      // We could have simply listened to the 'set' event that
      // would have been emitted by objects when their models were
      // updated and sent the results to a parser function that
      // would extract the calling object's properties in the config
      // and updated them if they were different, but we can't
      // currently do that the way the app is written, since we
      // didn't actually follow that patttern almost anywhere.
      //
      // jQuery.subscribe('set', function(junk) {
      //  // 1.) send the junk to a parser function
      //  // 2.) use this.set(parsedJunk) to update
      //  // this.currentConfig, with the side effect of
      //  // saving to localStorage.
      //
      // });

      // you may need to bind another event here that responds to the
      // user navigating history, for the purpose of popping the
      // history entry back off.

    },

    save: function() {
      var _this = this;

      // the hash must be stringified because
      // localStorage is a key:value store that
      // only accepts strings.

      localStorage.setItem(_this.sessionID, JSON.stringify(_this.currentConfig));
    }

  };

}(Mirador));

(function($) {

  $.trimString = function(str) {
    return str.replace(/^\s+|\s+$/g, '');
  };

  /* --------------------------------------------------------------------------
     Methods related to manifest data
     -------------------------------------------------------------------------- */

  $.getImageIndexById = function(imagesList, id) {
    var imgIndex = 0;

    jQuery.each(imagesList, function(index, img) {
      if ($.trimString(img['@id']) === $.trimString(id)) {
        imgIndex = index;
      }
    });

    return imgIndex;
  };

  $.getThumbnailForCanvas = function(canvas, width) {
    var version = "1.1",
    service,
    thumbnailUrl;

    // Ensure width is an integer...
    width = parseInt(width, 10);

    // Respecting the Model...
    if (canvas.hasOwnProperty('thumbnail')) {
      // use the thumbnail image, prefer via a service
      if (typeof(canvas.thumbnail) == 'string') {
        thumbnailUrl = canvas.thumbnail;
      } else if (canvas.thumbnail.hasOwnProperty('service')) {
        // Get the IIIF Image API via the @context
        service = canvas.thumbnail.service;
        if (service.hasOwnProperty('@context')) {
          version = $.Iiif.getVersionFromContext(service['@context']);
        }
        thumbnailUrl = $.Iiif.makeUriWithWidth(service['@id'], width, version);
      } else {
        thumbnailUrl = canvas.thumbnail['@id'];
      }
    } else {
      // No thumbnail, use main image
      var resource = canvas.images[0].resource;
      service = resource['default'] ? resource['default'].service : resource.service;
      if (service.hasOwnProperty('@context')) {
        version = $.Iiif.getVersionFromContext(service['@context']);
      }
      thumbnailUrl = $.Iiif.makeUriWithWidth(service['@id'], width, version);
    }
    return thumbnailUrl;
  };

  $.getImagesListByManifest = function(manifest) {
    return manifest.sequences[0].canvases;
  };

  $.getCollectionTitle = function(metadata) {
    return metadata.details.label || '';
  };

  /*
     miscellaneous utilities
     */

  $.genUUID = function() {
    var idNum = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });

    return idNum;
  };

  jQuery.fn.slideFadeToggle  = function(speed, easing, callback) {
    return this.animate({opacity: 'toggle', height: 'toggle'}, speed, easing, callback);
  };

  $.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;

    if (typeof options !== 'undefined') {
      options = {};
    }

    var later = function() {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  $.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  $.parseRegion  = function(url) {
    url = new URI(url);
    var regionString = url.hash();
    regionArray = regionString.split('=')[1].split(',');
    return regionArray;
  };

  $.getOsdFrame = function(region, currentImg) {
    var imgWidth = currentImg.width,
    imgHeight = currentImg.height,
    canvasWidth = currentImg.canvasWidth,
    canvasHeight = currentImg.canvasHeight,
    widthNormaliser = imgWidth/canvasWidth,
    heightNormaliser = imgHeight/canvasHeight,
    rectX = (region[0]*widthNormaliser)/imgWidth,
    rectY = (region[1]*heightNormaliser)/imgWidth,
    rectW = (region[2]*widthNormaliser)/imgWidth,
    rectH = (region[3]*heightNormaliser)/imgWidth;

    var osdFrame = new OpenSeadragon.Rect(rectX,rectY,rectW,rectH);

    return osdFrame;
  };

  // http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
  $.isOnScreen = function(elem, outsideViewportFactor) {
    var factor = 1;
    if (outsideViewportFactor) {
      factor = outsideViewportFactor;
    }
    var win = jQuery(window);
    var viewport = {
      top : (win.scrollTop() * factor),
      left : (win.scrollLeft() * factor)
    };
    viewport.bottom = (viewport.top + win.height()) * factor;
    viewport.right = (viewport.left + win.width()) * factor;

    var el = jQuery(elem);
    var bounds = el.offset();
    bounds.bottom = bounds.top + el.height();
    bounds.right = bounds.left + el.width();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
  };

  $.getRangeIDByCanvasID = function(structures, canvasID /*, [given parent range] (for multiple ranges, later) */) {
    var ranges = jQuery.grep(structures, function(range) { return jQuery.inArray(canvasID, range.canvases) > -1; }),
    rangeIDs = jQuery.map(ranges,  function(range) { return range['@id']; });

    return rangeIDs;
  };

  $.layoutDescriptionFromGridString = function (gridString) {
    var columns = parseInt(gridString.substring(gridString.indexOf("x") + 1, gridString.length),10),
    rowsPerColumn = parseInt(gridString.substring(0, gridString.indexOf("x")),10),
    layoutDescription = {
      type:'row'
    };

    if (gridString === "1x1") return layoutDescription;

    layoutDescription.children = [];

    // Javascript does not have range expansions quite yet,
    // long live the humble for loop.
    // Use a closure to contain the column and row variables.
    for (var i = 0, c = columns; i < c; i++) {
      var column = { type: 'column'};

      if (rowsPerColumn > 1) {
        column.children = [];
        for (var j = 0, r = rowsPerColumn; j < r; j++) {
          column.children.push({
            type: 'row'
          });
        }
      }

      layoutDescription.children.push(column);
    }

    return layoutDescription;
  };

  $.generateRange = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Configurable Promises
  $.createImagePromise = function(imageUrl) {
    var img = new Image(),
    dfd = jQuery.Deferred();

    img.onload = function() {
      dfd.resolve(img.src);
    };

    img.onerror = function() {
      dfd.reject(img.src);
    };

    dfd.fail(function() {
      console.log('image failed to load: ' + img.src);
    });

    img.src = imageUrl;
    return dfd.promise();
  };

}(Mirador));
})($jq19, $jq19);
