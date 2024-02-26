(function() {
  'use strict';

  window.Item = Backbone.Model.extend({
    defaults: {
      automatic: false,
      due_date: new Date(),
      type_id: 0,
      amount: "0.00",
      balance: "0.00",
      paid_date: null,
      notes: null,
    },

    toJSON: function() {
      var i = _.clone(this.attributes);
      i.automatic = (i.automatic ? 1 : 0).toString();
      i.amount = window.formatCurrency(i.amount);
      i.balance = window.formatCurrency(i.balance);
      i.due_date = formatDate(i.due_date);
      i.paid_date = formatDate(i.paid_date);
      return i;
    },

    parse: function(response, options) {
      var i = response;
      i.automatic = (i.automatic != '0');
      i.amount = window.formatCurrency(i.amount);
      delete i.balance;
      i.due_date = parseDate(i.due_date);
      i.paid_date = i.paid_date ? parseDate(i.paid_date) : undefined;
      return i;
    },
  });

  window.ItemList = Backbone.Collection.extend({
    url: function() {
      var url = app.base + 'api/v1/item';
      return url;
    },

    model: Item,
  });

  
  window.ItemViewModel = kb.ViewModel.extend({
    constructor: function() {
      var self = this;
      kb.ViewModel.prototype.constructor.apply(this, arguments);

      self.selected = ko.observable(false);

      self.type = ko.computed(function() {
        var id = self.type_id();
        var result = ko.utils.arrayFirst(app.viewmodel.types(), function (type) {
          return type.id() == id;
        });
	if (result == null) {
		result = app.viewmodel.types()[0];
	}
        return result;
      });

      self.repeat_type = ko.computed(function() {
        var id = self.type().repeat_type();
        var result = ko.utils.arrayFirst(app.viewmodel.repeat_types(), function (repeat_type) {
          return repeat_type.id() == id;
        });
        return result;
      });

      self.name = ko.computed(function() {
        var type = self.type();
        return type ? type.name() : '';
      });

      self.paid = ko.computed(function() {
        var today = new Date();

        if (self.paid_date() !== null && self.paid_date() <= today) {
          return true;
        } else if (self.due_date() <= today) {
          if (parseFloat(self.amount()) === 0.00)
            return true;
          else if (self.automatic())
            return true;
          else
            return false;
        }

        return false;
      });

      self.unpaid = ko.computed(function() {
        if (self.paid_date() == null && self.automatic() == false) {
          return true;
        }
        return false;
      });

      self.late = ko.computed(function() {
        var today = new Date();

        if (self.due_date() <= today) {
          if (parseFloat(self.amount()) === 0.00)
            return false;
          else if (self.automatic())
            return false;
          else if (self.paid_date() !== null && self.paid_date() <= today)
            return false;
          else
            return true;
        }

        return false;

      });

      self.paidDate = ko.computed(function() {
        if (self.paid_date()) {
            return self.paid_date();
        } else if (self.paid()) {
            return self.due_date();
        } else {
            return null;
        }
      });

      self.sortDate = ko.computed(function() {
        if (self.paid_date()) {
          return self.paid_date();
        }
        return self.due_date();
      });

      self.destroy = function() {
        self.model().destroy();
      };
    },
  });
})();
