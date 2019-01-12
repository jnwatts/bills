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

  window.Type.REPEAT_NONE = 0;
  window.Type.REPEAT_MONTHLY = 1;
  window.Type.REPEAT_WEEKLY = 2;
  window.Type.REPEAT_BIWEEKLY = 3;
  window.Type.repeat_types = [
    {id: Type.REPEAT_NONE, short_name: ' ', name: "None"},
    {id: Type.REPEAT_MONTHLY, short_name: 'M', name: "Monthly"},
    {id: Type.REPEAT_WEEKLY, short_name: 'W', name: "Weekly"},
    {id: Type.REPEAT_BIWEEKLY, short_name: 'BW', name: "Biweekly"},
  ];



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