(function() {
  'use strict';

  window.Type = Backbone.Model.extend({
    defaults: {
      name: "",
      default_value: "0.00",
      repeat_type: 0,
      description: null,
      notes: null,
      url: null,

      automatic: false,
      due_date: new Date(),
      type_id: 0,
      amount: "0.00",
      paid_date: null,
      notes: null,
    },

    toJSON: function() {
      var i = _.clone(this.attributes);
      i.default_value = i.default_value;
      return i;
    },

    parse: function(response, options) {
      var i = response;
      i.default_value = i.default_value ? parseFloat(i.default_value).toFixed(2) : null;
      i.repeat_type = parseInt(i.repeat_type);
      return i;
    },
  });

  window.TypeList = Backbone.Collection.extend({
    url: function() {
      var url = app.base + 'api/v1/type';
      return url;
    },

    model: Type,
  });

  window.TypeViewModel = kb.ViewModel.extend({
    constructor: function() {
      var self = this;
      kb.ViewModel.prototype.constructor.apply(this, arguments);

      self.selected = ko.observable(false);

      self.destroy = function() {
        self.model().destroy();
      };
    },
  });


})();