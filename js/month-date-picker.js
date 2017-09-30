(function() {
  'use strict';
  ko.bindingHandlers.monthPicker = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      // Register change callbacks to update the model
      // if the control changes.
      ko.utils.registerEventHandler(element, "change", function () {
        var value = valueAccessor();
        value(parseMonth(element.value));
      });
    },
    // Update the control whenever the view model changes
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var value =  valueAccessor();
      element.value = formatMonth(value());
    }
  };
  ko.bindingHandlers.datePicker = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      // Register change callbacks to update the model
      // if the control changes.
      ko.utils.registerEventHandler(element, "change", function () {
        var value = valueAccessor();
        value(parseDate(element.value));
      });
    },
    // Update the control whenever the view model changes
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var value =  valueAccessor();
      element.value = formatDate(value());
    }
  };
})();