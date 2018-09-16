(function() {
  'use strict';
  ko.bindingHandlers.bootstrapToggleOn = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var $elem = $(element);
      $(element).bootstrapToggle();
      if (ko.utils.unwrapObservable(valueAccessor())) {
        $elem.bootstrapToggle('on')
      }else{
         $elem.bootstrapToggle('off')
      }

      $elem.change(function() {
      if ($(this).prop('checked')) {
        valueAccessor()(true);
      }else{
        valueAccessor()(false);
      }
    })

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var vStatus = $(element).prop('checked');
      var vmStatus = ko.utils.unwrapObservable(valueAccessor());
      if (vStatus != vmStatus) {
        $(element).bootstrapToggle('toggle')
      }
    }
  };
})();