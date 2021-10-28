/**
 * @file
 */
(function ($, Drupal) {
  if ($('#block-subsitemenu ul.menu li').length) {
    // submenu is populated, collapsing main one.
    var mainMenu = $('#block-main-nav-mobile').addClass('menuCollapsed').hide();
    $('.main-menu-acc').removeClass('element-invisible');
    $('.main-menu-acc').on('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if (mainMenu.hasClass('menuCollapsed')) {
        $(this).removeClass('collapsed').addClass('submenu-open');
        mainMenu.removeClass('menuCollapsed').slideDown(500);
      }
      else {
        $(this).addClass('collapsed').removeClass('submenu-open');
        mainMenu.slideUp(500).addClass('menuCollapsed');
      }
    });
  }
  $('.layout-wrapper').on('click', function(e) {
    if ($('.block-mobile-menu').length) {
      $('.block-mobile-menu').removeClass('active');
    }
  });

  $('.mobile-menu-toggle').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if ($('.block-mobile-menu').length) {
      $('.block-mobile-menu').addClass('active');
    }
  });
  $('.menu-close').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if ($('.block-mobile-menu').length) {
      $('.block-mobile-menu').removeClass('active');
    }
  });
  $('#block-main-nav-mobile > ul.menu > li.menu-item--expanded .submenu .submenu-inner > ul').addClass('menuCollapsed').hide();
  $('#block-main-nav-mobile > ul.menu > li.menu-item--expanded > a').each(function(){
    if ($(this).parent().hasClass('menu-item--expanded')) {
      $(this).addClass('collapsed');
    }
  });
  $('#block-main-nav-mobile > ul.menu > li.menu-item--expanded > a').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var subMenu = $(this).parent().find('.submenu .submenu-inner > ul');
    if (subMenu.hasClass('menuCollapsed')) {
      $(this).removeClass('collapsed');
      subMenu.removeClass('menuCollapsed').slideDown(500);
    }
    else {
      $(this).addClass('collapsed');
      subMenu.slideUp(500).addClass('menuCollapsed');
    }
  });
})(jQuery, Drupal);
