/**
 * @file
 * A JavaScript file for the theme.
 */

(function($) {

  Drupal.behaviors.de_themeBehavior = {
    attach: function(context, settings) {
      if ('.grid-view-control'.length && $('.grid-view-control').hasClass('active')) {
        $('.view-id-objects').addClass('views-list');
        $('.view-id-objects .view-content .views-row').addClass("views-row-list");
      }
      //Set match height.
      $('div#block-views-block-essays-listing-essays .view-content .views-row').matchHeight();
      $('.culinary-team .people-list li').matchHeight();
      $('.block-views-blockwhat-s-on-ago-similar-events .views-row').matchHeight();
      $('.view-id-what_s_on_ago .ago-card').matchHeight();
      $('.view-id-objects.view-display-id-page_1 .views-row').matchHeight();
      $('.field-group-format-wrapper .field--name-field-related-works > .field__item').matchHeight();
      $('.media-card').matchHeight();
      $('.object-card').matchHeight();
      $('.exhibition-card').matchHeight();
      //attaching events navigation.
      if ($('.menu-toggle-anchor').length) {
        $('.menu-toggle-anchor').unbind('click');
        $('.menu-toggle-anchor').on('click', function(e) {
          $('.locator-nav .layout-container').toggleClass('expanded');
        });
      }
      //back button.
      if (window.history && window.history.length > 1) {
        $('.btn-back').unbind('click');
        $('.btn-back').on('click', function(e) {
          // Only override the default link behavior if the previous page.
          // visited matches the href of the back button link with a ? mark
          // on the end.
          // e.g.) If the previous link was /collection/browse?filters=whatever
          // and the btn-back href is /collection/browse
          var href = $('.btn-back').attr('href');
          href = href.replace(/\/$/, "");
          href = href + "?";
          if (document.referrer) {
            var previousUrl = document.referrer;
            e.preventDefault();
            e.stopPropagation();
            if (previousUrl.length && previousUrl.indexOf(href) != -1) {
              window.history.go(-1);
            } else {
              window.location.href = href;
            }
          }
        });
      }
      // Search button click and show up.
      $('#block-searchtoggle').on('click', function() {
        if (!$('.search-block-form').hasClass("active")) {
          $(".search-block-form").fadeIn(500);
          $('.search-block-form').addClass("active");
        } else if ($('.search-block-form').hasClass("active")) {
          $('.search-block-form').removeClass("active");
          $(".search-block-form").fadeOut(500);
        }
        //Click on clear values.
        $("#search-block-form .form-search").val('');
      });

      $('#search-block-form .form-submit').each(function() {
        $(this).attr('value', 'Go');
      });
      // Custom boxwood search button click and show up.
      if ($('#edit-expand-search').length) {
        $('#edit-expand-search > a').on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var searchBox = $('.search-wrapper');
          if (searchBox.hasClass('expanded')) {
            $('#general-search-form').submit();
          } else {
            $('.region--branding .layout-container').addClass('expanded');
            $('.block-general-search-block').addClass('expanded');
            $('#edit-expand-search > a').addClass('expanded');
            $('.search-wrapper').addClass('expanded').addClass('focus');
            $('.search-wrapper input').focus();
          }
        });

        $('.search-collapse').on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          $('.search-wrapper').removeClass('focus').removeClass('expanded');
          $('#edit-expand-search > a').removeClass('expanded');
          $('.block-general-search-block').removeClass('expanded');
          $('.region--branding .layout-container').removeClass('expanded');
        });
        $('.search-wrapper input').focusout(function() {
          $('.search-wrapper').removeClass('focus');
        });
        $('.search-wrapper input').focus(function() {
          $('.search-wrapper').addClass('focus');
        });
      }
    }
  };

  // Adding placeholder text to Course CT input field.
  $('#views-exposed-form-course-search-courses-grid').find('.form-text').attr('placeholder', 'Search Courses');
  // @authors custom stuff that happens for every screen size.
  $(function() {
    // Add any media helpers wrappers to help with responsive video.
    $('.node-page iframe').each(function() {
      $(this).wrap('<div class="media-embed">');
    });
    $('.node-page object').each(function() {
      $(this).wrap('<div class="media-embed">');
    });
    $('.node-page embed').each(function() {
      $(this).wrap('<div class="media-embed">');
    });
    // anchors for the mobile.
    var mobileMenuLinks = $('.mm-listview a');
    mobileMenuLinks.on('click', function(e) {
      var hash = $(e.target.hash);
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function() {
        // Add hash (#) to URL when done scrolling (default click behavior).
        window.location.hash = e.target.hash;
        $('.toolbar-tray').css('overflow-x', 'visible');
      });
    });
    // Disable sidebar primary if there is no content.
    if ($('#sidebar-primary').children().length === 0) {
      $('body').removeClass('layout-one-sidebar-display');
    }
    // Add class for login button.
    $('#block-de-theme-account-menu .menu a').each(function() {
      if ($(this).attr('href') == "/user/login") {
        $(this).addClass("login-btn");
      }
    });
    // Check if figure have figcaption tag inside,
    // If it does, add wrapper class around figure
    // var imgWidth = $('figure article img').width();
    $('figure').each(function() {
      if ($(this).find('figcaption').text()) {
        $(this).wrapAll("<div class='figure-box'></div>");
      }
      if ($(this).hasClass('align-center')) {
        $(this).parent().addClass('img-wrapper-center');
      }
      // $('figure figcaption').width(imgWidth);
    });

    $(".node--type-exhibition-boxwood #sidebar-primary a").on('click', function(event) {
      if (this.hash !== "") {
        // Prevent default anchor click behavior.
        event.preventDefault();
        var hash = this.hash;
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 600, function() {
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        });
      } // End if.
    });

    $(".locator-nav .nav-bar a").on('click', function(event) {
      if (this.hash !== "") {
        // Prevent default anchor click behavior.
        event.preventDefault();
        var hash = this.hash;
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 600, function() {
          window.location.hash = hash;
        });
      } // End if.
    });

    $("#block-teacherandstudentsresourceslinks a").on('click', function(event) {
      if (this.hash !== "") {
        // Prevent default anchor click behavior.
        event.preventDefault();
        var hash = this.hash;
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 800, function() {
          // Add hash (#) to URL when done scrolling (default click behavior).
          window.location.hash = hash;
        });
      } // End if.
    });

    // Compare tool float with scrolling.
    if ($(".compare-toolbox-wrapper").length) {
      var targetOffset = $(".compare-toolbox-wrapper").offset().top;
      var targetOffsetb = $("#middle-full-width").offset().top - 150;
      var $el = $('.compare-toolbox-wrapper');
      var $window = $(window);
      var $body = $('body');
      $window.on("scroll resize touchmove", function(e) {
        targetOffset = $("#block-exposedformcollection-searchcollection-browse-page").offset().top + $("#block-exposedformcollection-searchcollection-browse-page").outerHeight(true);
        targetOffsetb = $("#middle-full-width").offset().top - 150;
        var scrollTop = $window.scrollTop();
        if (scrollTop > targetOffset && scrollTop < targetOffsetb) {
          $el.css({
            position: 'fixed',
            top: 0,
            bottom: "auto",
            WebkitOverflowScrolling: "auto",
            transform: "translate3d(0,0,0)"
          });
        } else {
          $el.css({
            position: 'relative',
            top: "auto",
            bottom: "auto"
          });
        }
        /* if (scrollTop > targetOffsetb) {
             $el.css({
                 position: 'relative',
                 top: "auto",
                 bottom: "auto"
             });
         }*/

        /* Add styling class for mobile */
        if (parseInt($(window).width()) > 896) {
          $el.removeClass('compare-tool-mobile');
        } else {
          $el.addClass('compare-tool-mobile');
        }
      });
    }

    function touchStart(event) {}
    // Object thumbnails functionality.
    var thumbs = $('.thumb-image-wrapper img');
    if (thumbs.length) {
      // Slider arrows.
      // next arrow.
      var nextArrow = $('.navigation-wrapper .arrow-next');
      var prevArrow = $('.navigation-wrapper .arrow-prev');
      nextArrow.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var currentImage = $('.main-image-wrapper img.active-image').removeClass('active-image').attr('class');
        var cId = currentImage.substr(5);
        if (cId.length) {
          cId++;
          if (cId > thumbs.length) {
            cId = 1;
          }
          $('.thumb-' + cId).click();
        }
      });
      var mainImage = $('.main-image-wrapper img').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var currentImage = $('.main-image-wrapper img.active-image').removeClass('active-image').attr('class');
        var cId = currentImage.substr(5);
        if (cId.length) {
          cId++;
          if (cId > thumbs.length) {
            cId = 1;
          }
          $('.thumb-' + cId).click();
        }
      });
      prevArrow.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var currentImage = $('.main-image-wrapper img.active-image').removeClass('active-image').attr('class');
        var cId = currentImage.substr(5);
        if (cId.length) {
          cId--;
          if (cId === 0) {
            cId = thumbs.length;
          }
          $('.thumb-' + cId).click();
        }
      });
      thumbs.each(function() {
        $(this).on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var clickedImage = $(e.target);
          var id = clickedImage.attr('id');
          id = id.substr(6);
          if (id.length) {
            thumbs.removeClass('active-thumb-image');
            $('.thumb-' + id).addClass('active-thumb-image');
            $('.main-image-wrapper img').css('opacity', 0);
            $('.main-image-wrapper img').removeClass('active-image').addClass('element-invisible');
            $('.main-' + id).removeClass('element-invisible').addClass('active-image');
            $('.main-' + id).animate({
              opacity: 1
            }, 400, function() {
              // Animation complete.
            });
          }
        });
      });
    }

    // Make Accordion Functions JH & TT
    // function make_accordions_h2() {
    //     var accTitle_h2 = $('.make-accordion').children("div").children("h2");
    //     var accContent_h2 = accTitle_h2.parent().next(".node__content");
    //     if (accTitle_h2.parent().parent().hasClass("show-collapsed")) {
    //         accContent_h2.hide();
    //     };
    //     accTitle_h2.on('click', function() {
    //         $(this).toggleClass('accordion-minus');
    //         $(this).parent().next(".node__content").slideToggle("500");
    //     });
    // }
    // make_accordions_h2();

    // function make_accordions_h3() {
    //     var accTitle_h3 = $('.make-accordion').children("h3");
    //     var accContent_h3 = accTitle_h3.next(".node__content");
    //     if (accTitle_h3.parent().hasClass("show-collapsed")) {
    //         accTitle_h3.parent().children("div.node__content").slideToggle("500");
    //     };
    //     accTitle_h3.on('click', function() {
    //         $(this).toggleClass('accordion-minus');
    //         $(this).parent().children("div.node__content").slideToggle("500");
    //     });
    // }
    // make_accordions_h3();

    // function make_accordions_sub_faqs() {
    //     var accTitle_sub = $('.sub-accordion').children(".node__content").children(".sub-accordions-wrapper").children(".field__items").children(".field__item").children(".node").children("h3");
    //     var accContent_sub = accTitle_sub.next(".node__content");
    //     if (accTitle_sub.parent().parent().parent().parent().parent().parent().hasClass("sub-collapsed")) {
    //         accTitle_sub.parent().children("div.node__content").slideToggle("500");
    //     };
    //     accTitle_sub.on('click', function() {
    //         $(this).toggleClass('accordion-minus');
    //         $(this).parent().children("div.node__content").slideToggle("500");
    //     });
    // }
    // make_accordions_sub_faqs();

    //Function to Remove a Tags from selected content TT.
    function removeGridLinks() {
      $('article.removelinks .image-group a').each(function() {
        $(this).contents().unwrap();
      });

      $('article.removelinks h3 > a').each(function() {
        $(this).contents().unwrap();
      });
    }
    removeGridLinks();

    // FAQ for courses
    var faqTitle = $('.block-views-blockagoc-courses-view-faq-block h2');
    var faqContent = $('.block-views-blockagoc-courses-view-faq-block .view-agoc-courses-view');

    // FAQ for events
    var faqTitleEvents = $('.block-views-blockwhat-s-on-ago-faq-block h2');
    var faqContentEvents = $('.block-views-blockwhat-s-on-ago-faq-block .view-what-s-on-ago');

    // faqTitle.on('click', function() {
    //     if (faqContent.css('display') == 'none') {
    //         faqContent.slideDown(500);
    //         faqTitle.addClass('accordion-minus');
    //     } else {
    //         faqContent.slideUp(500);
    //         faqTitle.removeClass('accordion-minus');
    //     }
    // });

    // faqContentEvents.hide();
    // faqTitleEvents.on('click', function() {
    //     if (faqContentEvents.css('display') == 'none') {
    //         faqContentEvents.slideDown(500);
    //         faqTitleEvents.addClass('accordion-minus');
    //     } else {
    //         faqContentEvents.slideUp(500);
    //         faqTitleEvents.removeClass('accordion-minus');
    //     }
    // });

    // var accordionTitle = $('.paragraph--type--accordion .field--name-field-dags-plain-title');
    // var accordionContent = $('.paragraph--type--accordion .field--name-field-content');
    // var accordionExpandAll = $('.node--type-dags-accordion .accordion-expand-all-toggle');
    // accordionContent.hide();
    // accordionContent.addClass('collapsed');
    // accordionTitle.on('click', function() {
    //     if ($(this).next().hasClass('collapsed')) {
    //         $(this).next().slideDown(500);
    //         $(this).addClass('accordion-minus');
    //         $(this).next().removeClass('collapsed');
    //     } else {
    //         $(this).next().slideUp(500);
    //         $(this).removeClass('accordion-minus');
    //         $(this).next().addClass('collapsed');
    //     }
    // });
    // accordionExpandAll.on('click', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if ($(this).hasClass('collapse')) {
    //         $(this).parents('article').find('.paragraph--type--accordion .field--name-field-dags-plain-title').addClass('accordion-minus');
    //         $(this).parents('article').find('.paragraph--type--accordion .field--name-field-content').addClass('collapsed').slideUp(500);
    //         $('.node--type-dags-accordion .accordion-expand-all-toggle').text('Expand All');
    //         $("html, body").animate({ scrollTop: 0 }, "slow");
    //     } else {
    //         $(this).parents('article').find('.paragraph--type--accordion .field--name-field-dags-plain-title').removeClass('accordion-minus');
    //         $(this).parents('article').find('.paragraph--type--accordion .field--name-field-content').removeClass('collapsed').slideDown(500);
    //         $(this).text('Collapse All');
    //     }
    //     $(this).toggleClass('collapse');

    // });

    // // Make accordion working for object item
    // $('.node--type-object.node--view-mode-full .accordion-item').on('click', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     var target = e.target;
    //     $(target).toggleClass('accordion-open');
    //     $(target).next().slideToggle();
    //     $(target).toggleClass('accordion-item');
    // });

    // //Remove <a> tag for accordion item to fix click problem
    // $('.node--type-object.node--view-mode-full .accordion-item a').each(function() {
    //     $this = $(this);
    //     $this.contents().unwrap();
    // });

    // // Opening accordion itemss
    // var accordions = $('.node--type-object.node--view-mode-full .accordion-item');
    // accordions.each(function() {
    //     if ($(this).next().hasClass('default-open')) {
    //         $(this).toggleClass('accordion-open');
    //         $(this).next().slideToggle();
    //         $(this).toggleClass('accordion-item');
    //     }
    // });

    if ($('.block-views-blockobjects-mirador-image .view-footer').length && !$('.block-views-blockobjects-mirador-image .main-image-wrapper').length) {
      $('.block-views-blockobjects-mirador-image .view-footer').hide();
    }
    // Collection Search Filter toggle.
    $('.path-collection .form-wrapper legend span').focus(function() {
      $(this).on('keydown', function(e) {
        if (e.keyCode == 32) {
          e.preventDefault();
          $(this).trigger('click');
        }
      });

    }).blur(function() {
      $(this).unbind('keydown');
    }).attr('tabIndex', 0);
    $('.path-collection .form-wrapper legend span').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var target = $(e.target);
      target.toggleClass('indeterminate');
      target.toggleClass('fieldset-legend');
      if (target.hasClass('fieldset-legend')) {
        target.parent().parent().find('.more-options').addClass('element-invisible');
      } else {
        var options = target.parent().parent().find('.fieldset-wrapper');
        //reOrderCheckboxes(options);
        options.each(function() {
          $(this).find('.form-item').each(function(i) {
            if (i > 11) {
              $(this).addClass('element-invisible');
            }
          });
        });
        target.parent().parent().find('.more-options').removeClass('element-invisible');
      }
      target.parent().parent().find('.fieldset-wrapper').slideToggle(200);
    });

    $('.path-user .block-views-exposed-filter-blockobjects-my-collections .form-wrapper legend span').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var target = $(e.target);
      target.toggleClass('indeterminate');
      target.toggleClass('fieldset-legend');
      if (target.hasClass('fieldset-legend')) {
        target.parent().parent().find('.more-options').addClass('element-invisible');
      } else {
        var options = target.parent().parent().find('.fieldset-wrapper');
        options.each(function() {
          $(this).find('.form-item').each(function(i) {
            if (i > 10) {
              $(this).addClass('element-invisible');
            }
          });
        });
        target.parent().parent().find('.more-options').removeClass('element-invisible');
      }
      target.parent().parent().find('.fieldset-wrapper').slideToggle(200);
    });

    var moreOptions = $('.more-options');
    moreOptions.on('click', function(e) {
      console.log('click');
      e.preventDefault();
      e.stopPropagation();
      var target = $(e.target);
      var html = target.parent().find('> div').html();
      // getting all of the checkboxes and attaching the click events
      if (html.length && $('#block-filterspopupwrapper').length) {
        var text = target.parent().find('legend span').text();
        text += '<span class="element-invisible">Please select a filter</span>';
        $('#block-filterspopupwrapper h2').html(text);
        $('#block-filterspopupwrapper > h2').wrap('<div class="collection-modal-filterset-title">');
        var parent = $('#block-filterspopupwrapper #filters-pop-up-form #edit-options');
        parent.html(html);
        parent.find('.form-item').removeClass('element-invisible');
        $(parent.find('.form-item')).each(function() {
          var aid = $($(this).find('input')[0]).attr('id');
          $($(this).find('input')[0]).attr('id', aid + '_pop');
          $($(this).find('label')[0]).attr('for', aid + '_pop');
          $(this).on('click', function(e) {
            e.preventDefault();
            var checkboxesopts = target.parent().find('.fieldset-wrapper');
            var idcb = $(e.target).parent().find('input')[0].id;
            idcb = idcb.substring(0, idcb.length - 4);
            if (idcb.length) {
              $('.views-auto-submit-full-form #' + idcb).trigger('click');
            }
            $('#cboxClose').click();
          });
        });
      }
      initColorboxBlock('#block-filterspopupwrapper');
    });
    moreOptions.focus(function() {
      $(this).on('keydown', function(e) {
        if (e.keyCode == 32) {
          e.preventDefault();
          $(this).trigger('click');
        }
      });

    }).blur(function() {
      $(this).unbind('keydown');

    }).attr('tabIndex', 0);
    $('.fieldset-wrapper').each(function() {
      var that = $(this);
      $cbs = $(this).find('input');
      var isChecked = false;
      $cbs.each(function() {
        if ($(this).attr('checked')) {
          isChecked = true;
        }
        $(this).on('click', function() {
          if ($(this).attr('checked')) {
            $(this).removeAttr('checked');
          } else {
            $(this).attr('checked', 'checked');
          }
        });

      });
      if (isChecked) {
        that.parent().find('legend span').click();
      }
    });
    //Search result page advanced filter toggle
    $('.path-search .fieldset-legend').toggleClass('search-close');
    $('.path-search .fieldset-legend').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var target = $(e.target);
      target.parent().parent().find('.fieldset-wrapper').slideToggle(200);
      target.toggleClass('search-expend');
    });
    //Remove help link on search result page
    $('.path-search .search-page-form a#edit-help-link').remove();
    // If there is no object image, place a default one.
    $(document).ajaxStop(function() {
      var objImages = $('.path-collection .object-image a');
      var myobjImages = $('.path-user .object-image a');
      objImages.each(function() {
        if ($(this).children().length === 0) {
          $(this).append("<img src='/themes/custom/de_theme/img/imagenotavailable.jpg' alt='Image not available' />");
        }
      });
      myobjImages.each(function() {
        if ($(this).children().length === 0) {
          $(this).append("<img src='/themes/custom/de_theme/img/imagenotavailable.jpg' alt='Image not available' />");
        }
      });
    });
    $('.path-collection .object-image a').each(function() {
      if ($(this).children().length === 0) {
        $(this).append("<img src='/themes/custom/de_theme/img/imagenotavailable.jpg' alt='Image not available' />");
      }
    });
    $('.path-user .object-image a').each(function() {
      if ($(this).children().length === 0) {
        $(this).append("<img src='/themes/custom/de_theme/img/imagenotavailable.jpg' alt='Image not available' />");
      }
    });
    //View list on click function.
    $("#block-viewaslist").click(function() {
      $('.view-object').toggleClass('views-list');
      $('.view-objects .view-content .views-row').toggleClass("views-row-list");
      if ($('#block-viewaslist .list-view-control').hasClass('active')) {
        $('.list-view-control').removeClass('active');
        $('.grid-view-control').addClass('active');
      } else if ($('#block-viewaslist .grid-view-control').hasClass('active')) {
        $('.grid-view-control').removeClass('active');
        $('.list-view-control').addClass('active');
      }
    });

    ssm.addState({
      id: 'standard-screen',
      query: '(min-width: 992px)',
      onEnter: function() {
        $('.mm-panels #mm-1').removeClass('mm-opened mm-current').addClass('mm-hidden');
        $('.mm-panels #mm-2').removeClass('mm-hidden').addClass('mm-opened mm-current');
        $('.mm-navbar .mm-btn').removeClass('mm-prev');
        $("a.mm-title").removeAttr("href");
      },
      onLeave: function() {
        $('.mm-panels #mm-1').addClass('mm-opened mm-current').removeClass('mm-hidden');
        $('.mm-panels #mm-2').removeClass('mm-opened mm-current').addClass('mm-hidden');
        $('.mm-navbar .mm-btn').addClass('mm-prev');
      }
    });

    ssm.addState({
      id: 'small-screen',
      query: '(max-width: 991px)',
      onEnter: function() {
        // Copy subsite menu to hamburger menu.
        if ($('#block-subsitemenu .block-inline-blockmenu-link .field__items').length == 0) {
          $('#floating-submenu').clone().appendTo('#block-subsitemenu');
        }
        // Submenu is populated, collapsing main one.
        wrapMainMenu();
      }
    });
  });

  function wrapMainMenu() {
    if ($('#block-subsitemenu .block-inline-blockmenu-link .field__items').length) {
      var mainMenu = $('#block-main-nav-mobile').addClass('menuCollapsed').hide();
      $('.main-menu-acc').removeClass('element-invisible');
      $('.main-menu-acc').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (mainMenu.hasClass('menuCollapsed')) {
          $(this).removeClass('collapsed').addClass('submenu-open');
          mainMenu.removeClass('menuCollapsed').slideDown(500);
        } else {
          $(this).addClass('collapsed').removeClass('submenu-open');
          mainMenu.slideUp(500).addClass('menuCollapsed');
        }
      });
    }
  }

  // open colorbox for block id.
  function initColorboxBlock(blockId) {
    /* Removing this so CSS can handle the sizing
    var width = '20%';
    if (parseInt($(window).width()) < 608) {
      width = '90%';
    }
    else if (parseInt($(window).width()) < 992) {
      width = '70%';
    }
    else if (parseInt($(window).width()) < 1188) {
      width = '40%';
    }
    else if (parseInt($(window).width()) < 2000) {
      width = '30%';
    }
    */
    $(blockId).show();
    $.colorbox({
      href: blockId,
      inline: true,
      onClosed: function() {
        $('#block-filterspopupwrapper').hide();
      }
    });
  }

  // Reorder checkboxes
  function reOrderCheckboxes(list) {
    origOrder = list.find('.form-item');
    var i, checked = document.createDocumentFragment(),
      unchecked = document.createDocumentFragment();
    for (i = 0; i < origOrder.length; i++) {
      if (origOrder[i].getElementsByTagName("input")[0].checked) {
        checked.appendChild(origOrder[i]);
      } else {
        unchecked.appendChild(origOrder[i]);
      }
    }
    list.append(checked).append(unchecked);
  }

  $(window).resize(function() {
    // wrap each table in a div so we can do overflow scroll on the div. Should be improved to check for table width and parent container width.
    $('.field-name-body table').each(function() {
      var $tableWidth = $(this).outerWidth();
      var $bodyWidth = $(this).closest('.field-name-body').width();

      if ($tableWidth > $bodyWidth) {
        if (!$(this).closest('.table-responsive').length) {
          $(this).wrap('<div class="table-responsive">');
        }
        if (!$(this).closest('.table-responsive').find('.table-controls').length) {
          $(this).before('<div class="table-controls"><span class="instruction"><span class="material-icons">swap_horiz</span> Scroll/Swipe to see more</span></div>');
        }
      } else {
        if ($(this).closest('.table-responsive').length) {
          $(this).closest('.table-responsive').find('.table-controls').remove();
          $(this).unwrap();
        }
      }
    });
  });

  // Force a resize event cuz Ian says so
  //$(window).load(function(){
  //  $(window).resize();
  //  $(".spinner").fadeOut("slow");
  //});


  // ++++++++++ FAQ functionality
  $('.node--type-faq > h3').on('click', function() {
    if($(this).parents('.block-accordion-sub-accordions-closed').length || $(this).parents('.block-sub-accordion-closed').length) {
      $(this).toggleClass('accordion-minus');
      $(this).closest('.node--type-faq').find('.node__content').slideToggle('slow');
    }
    else {
      $(this).toggleClass('accordion-plus');
      $(this).closest('.node--type-faq').find('.node__content').slideToggle('slow');
    }
  });

  // ++++++ PDF icon
  $(document).ready(function() {
    $('a').each(function() {
      var attr = $(this).attr('type');
      if (attr !== undefined && "attr:contains('application/pdf')") {
        $(this).addClass('file--mime-application-pdf file--application-pdf');
      }
    });
  });

  // ++++++ Alert block
  $(document).ready(function() {
      let menu = $('.region--branding');
      let alert = $('.block-views-blockalert-block-alert');
      let alert_front = $('.block-views-blockalert-block-alert-front');
      let alert_f_height = alert_front.outerHeight();
      let weirdScreen = window.matchMedia('(max-width: 767px)');

      if (((alert.length > 0) || (alert_front.length > 0)) && ($('.hide-mobile').length > 0)) {
        $('.layout-header').addClass("alert-branding-desktop");
        if(!(weirdScreen.matches)) {
          menu.css('margin-top', alert_f_height);
        }
      }
      if (((alert.length > 0) || (alert_front.length > 0)) && ($('.hide-desktop').length > 0)) {
        $('.layout-header').addClass("alert-branding-mobile");
        if(weirdScreen.matches) {
          menu.css('margin-top', alert_f_height);
        }
      }
      if (((alert.length > 0) || (alert_front.length > 0)) && ($('.hide-both').length > 0)) {
        $('.layout-header').addClass("alert-branding-hidden");
      }
      if (((alert.length > 0) || (alert_front.length > 0)) && ($('.hide-desktop').length <= 0) && ($('.hide-mobile').length <= 0)) {
        $('.layout-header').addClass("alert-branding-visible");
        menu.css('margin-top', alert_f_height);
      }
  });
  $(document).scroll(function() {
    let menu = $('.block-menu');
    let alert = $('.block-views-blockalert-block-alert');
    let alert_front = $('.block-views-blockalert-block-alert-front');

    if ($(document).scrollTop() < menu.offset().top + menu.height()) {
      alert.css('top', '0');
      alert_front.css('top', '0');
    } else if ($(document).scrollTop() > menu.offset().top + menu.height()) {
      alert.css('top', '-400px');
      alert_front.css('top', '-400px');
    }
  });

  $(document).ready(function() {
    if ($('.block-inline-blockmenu-link.float-menu').length) {
      var top = $('.block-inline-blockmenu-link.float-menu').offset().top - parseFloat($('.block-inline-blockmenu-link.float-menu').css('marginTop').replace(/auto/, 100));
      //var el = $('.region--dags-top');
      //if(el.length){
      //var bottom = el.offset().top /*.position().top */ + top - 100;
      //}
      $(window).scroll(function(event) {
        if ($('#block-mobilemenu').hasClass('active')) {
          // Do not trigger this when mobile menu is opened.
          return;
        }
        // what the y position of the scroll is
        var y = $(this).scrollTop();

        // whether that's below the form
        //if (y >= top && y <=bottom) {
        if (y >= top) {
          // if so, ad the fixed class
          $('.block-inline-blockmenu-link.float-menu').addClass('floatmenufixed');
        } else {
          // otherwise remove it
          $('.block-inline-blockmenu-link.float-menu').removeClass('floatmenufixed');
        }
      });
    }
  });


})(jQuery);
