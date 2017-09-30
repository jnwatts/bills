(function () {
  ko.bindingHandlers.triState = {
    init: function (element, valueAccessor) {
      element.onclick = function () {
        var value = valueAccessor();
        var unwrappedValue = ko.unwrap(value);
 
        if (unwrappedValue) {
          value(null);
        } else if (unwrappedValue === false) {
          value(true);
        } else {
          value(false);
        }
      };
    },
    update: function (element, valueAccessor) {
      var value = ko.unwrap(valueAccessor());
 
      if (value) {
        markChecked(element);
      } else if (value === false) {
        markUnchecked(element);
      } else {
        markUnspecified(element);
      }
    }
  };
 
  function markChecked(el) {
    el.readOnly = false;
    el.indeterminate = false;
    el.checked = true;
  }
 
  function markUnchecked(el) {
    el.readOnly = false;
    el.indeterminate = false;
    el.checked = false;
  }
 
  function markUnspecified(el) {
    el.readOnly = true;
    el.indeterminate = true;
    el.checked = false;
  }
}());
