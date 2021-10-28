(function ($, Drupal) {
  function attachClick() {
    $('#cal-frame td').unbind('click').on('click', function(e) {
      var day = $(e.target);
      $('#cal-frame td').removeClass('selected-day');
      day.addClass('selected-day');
      var month = day.attr('data-month');
      month++;
      if (month <= 9) {
        month = '0' + month;
      }
      var dayText = day.text();
      if (dayText <= 9) {
        dayText = '0' + dayText;
      }
      var date = day.attr('data-year') + '-' + month + '-' + dayText;
      $('.form-date').val(date);
      $('.block-views-exposed-filter-blockevents-search-whats-on-list-view .form-submit').click();
    });
  }
  var CALENDAR = function () {
    var wrap, label,
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function init(newWrap) {
      wrap     = $(newWrap || "#cal");
      label    = wrap.find("#label");
      wrap.find("#prev").unbind("click.calendar").bind("click.calendar", function () { switchMonth(false); });
      wrap.find("#next").unbind("click.calendar").bind("click.calendar", function () { switchMonth(true);  });
      label.unbind('click');
      var urlDate =  getParameterByName('event_date');
      if (urlDate && urlDate.length) {
        label.bind("click", function () { switchMonth(null, new Date(urlDate).getMonth(), new Date(urlDate).getFullYear()); });
      }
      else {
        label.bind("click", function () { switchMonth(null, new Date().getMonth(), new Date().getFullYear()); });
      }

      label.click();
      $('#block-agowhatsoncalendar').show();
    }

    function switchMonth(next, month, year) {
      var curr = label.text().trim().split(" "), calendar, tempYear =  parseInt(curr[1], 10);
      console.log(month);
      if (!month && month != 0 ) {
        month = ((next) ? ( (curr[0] === "December") ? 0 : months.indexOf(curr[0]) + 1 ) : ( (curr[0] === "January") ? 11 : months.indexOf(curr[0]) - 1 ));
      }
      year = year || ((next && month === 0) ? tempYear + 1 : (!next && month === 11) ? tempYear - 1 : tempYear);
      calendar =  createCal(year, month);
      $("#cal-frame", wrap)
          .find(".curr")
              .removeClass("curr")
              .addClass("temp")
          .end()
          .prepend(calendar.calendar())
          .find(".temp")
              .fadeOut("slow", function () { $(this).remove(); });

      $('#label').text(calendar.label);

      attachClick();
    }

    function getParameterByName(name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function createCal(year, month) {
      var day = 1, i, j, haveDays = true,
      startDay = new Date(year, month, day).getDay(),
      daysInMonths = [31, (((year%4==0)&&(year%100!=0))||(year%400==0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      calendar = [];
      if (createCal.cache[year]) {
        if (createCal.cache[year][month]) {
            return createCal.cache[year][month];
        }
      }
      else {
        createCal.cache[year] = {};
      }


      i = 0;
      while (haveDays) {
        calendar[i] = [];
        for (j = 0; j < 7; j++) {
          if (i === 0) {
            if (j === startDay) {
              calendar[i][j] = day++;
              startDay++;
            }
          }
          else if (day <= daysInMonths[month]) {
            calendar[i][j] = day++;
          }
          else {
            calendar[i][j] = "";
            haveDays = false;
          }
          if (day > daysInMonths[month]) {
            haveDays = false;
          }
        }
        i++;
      }

      // if (calendar[5]) {
      //   for (i = 0; i < calendar[5].length; i++) {
      //     if (calendar[5][i] !== "") {
      //       calendar[4][i] = "<span>" + calendar[4][i] + "</span><span>" + calendar[5][i] + "</span>";
      //     }
      //   }
      //   calendar = calendar.slice(0, 5);
      // }
      for (i = 0; i < calendar.length; i++) {
        calendar[i] = '<tr><td data-year="' + year + '" data-month="' + month + '">' + calendar[i].join('</td><td data-year="' + year + '" data-month="' + month + '">') + "</td></tr>";
      }
      calendar = $("<table>" + calendar.join("") + "</table>").addClass("curr");

      $("td:empty", calendar).addClass("nil");
      // Check for the date in the query.
      var date = getParameterByName('event_date');
      if (date && date.length && month === new Date(date).getMonth()) {
        var d = new Date(date);
        d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
        $('td', calendar).filter(function () { return $(this).text() === d.getDate().toString(); }).addClass("selected-day");
      }
      else if (month === new Date().getMonth()) {
        $('td', calendar).filter(function () { return $(this).text() === new Date().getDate().toString(); }).addClass("selected-day");
      }
      createCal.cache[year][month] = { calendar : function () { return calendar.clone(); }, label : months[month] + " " + year };

      return createCal.cache[year][month];
    }

    createCal.cache = {};
    return {
        init : init,
        switchMonth : switchMonth,
        createCal   : createCal
    };
  };
  Drupal.behaviors.ago_whats_on = {
    attach: function (context, settings) {
      $(document).on('ajaxStop', function() {
        attachClick();
      });
    }
  };
  $(document).ready(function() {
    var cal = CALENDAR();
    cal.init();
  });
})(jQuery, Drupal);

