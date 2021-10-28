/**
 * @file
 */
(function ($, Drupal) {
  cleanUp();
  $('#block-de-theme-main-menu > ul.menu > li.menu-item--expanded > a').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var subMenu = $(this).parent().find('.submenu-inner > ul');
    if (subMenu.hasClass('menuCollapsed')) {
      cleanUp();
      $(this).removeClass('collapsed').addClass('submenu-open');
      subMenu.removeClass('menuCollapsed').slideDown(500);
    }
    else {
      $(this).addClass('collapsed').removeClass('submenu-open');
      subMenu.slideUp(500).addClass('menuCollapsed');
    }
  });
  $('.close-btn-main').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var subMenu = $(this).parents('.submenu').find('.submenu-inner > ul');
    $(this).parent().find(' > a').addClass('collapsed').removeClass('submenu-open');
    subMenu.slideUp(500).addClass('menuCollapsed');
  });
  $('.layout-wrapper').on('click', function(e) {
    cleanUp();
  });

  function cleanUp() {
    $('#block-de-theme-main-menu > ul.menu > li.menu-item--expanded .submenu-inner > ul').addClass('menuCollapsed').hide();
    $('#block-de-theme-main-menu > ul.menu > li.menu-item--expanded > a').each(function(){
      if ($(this).parent().hasClass('menu-item--expanded')) {
        $(this).addClass('collapsed');
      }
    });
  }
})(jQuery, Drupal);
