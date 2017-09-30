var app = window.app = window.app || {};
(function() {
'use strict';

  window.parseMonth = function(str) {
    if (str) {
      return moment(str).toDate();
    } else {
      return null;
    }
  };

  window.parseDate = function(str) {
    var result = null;
    if (str) {
      // We expect ONLY the date from the DB. Strip any time or zone info
      str = str.replace(/T[0-9:]+.*/, '');
      result = moment(str).toDate();
    }
    return result;
  };

  window.formatMonth = function(date) {
    if (!date)
      return null;

    var m;
    if (date instanceof Date) {
      m = moment(date);
    } else {
      m = moment(date, ["YYYY-MM", "YYYY/MM"]);
    }

    return m.format("YYYY-MM");
  };

  window.formatDate = function(date) {
    if (!date)
      return null;

    //TODO: Handle garbage input.. maybe with try {} catch {}?
    var m;
    if (date instanceof Date) {
      m = moment(date);
    } else {
      m = moment(date, ["YYYY-MM-DD", "YYYY/MM/DD"]);
    }

    return m.format("YYYY-MM-DD");
  };

  window.formatCurrency = function(value) {
    return parseFloat(value).toFixed(2);
  };
})();
