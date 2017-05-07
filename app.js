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
    if (str) {
      /*
      var y = str.substr(0,4),
          m = str.substr(5,2) - 1,
          d = str.substr(8,2);
          */
      return moment(str).toDate(); //new Date(y,m,d);
    } else {
      return null;
    }
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

    // var d = m.toDate(),
    //     month = '' + (d.getMonth() + 1),
    //     day = '' + d.getDate(),
    //     year = d.getFullYear();

    // if (month.length < 2) month = '0' + month;
    // if (day.length < 2) day = '0' + day;

    // return [year, month, day].join('-');
  };

  window.formatCurrency = function(value) {
    return parseFloat(value).toFixed(2);
  };

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

  app.base = $('base')[0] && $('base')[0].href || '';

  var Item = app.Item = Backbone.Model.extend({
    defaults: {
      automatic: false,
      due_date: new Date(),
      type_id: 0,
      amount: "0.00",
      paid_date: null,
      notes: null,
    },

    toJSON: function() {
      var i = _.clone(this.attributes);
      i.automatic = (i.automatic ? 1 : 0).toString();
      i.amount = i.amount;
      i.due_date = formatDate(i.due_date);
      i.paid_date = formatDate(i.paid_date);
      return i;
    },

    parse: function(response, options) {
      var i = response;
      i.automatic = (i.automatic != '0');
      i.amount = parseFloat(i.amount).toFixed(2);
      i.due_date = parseDate(i.due_date);
      i.paid_date = i.paid_date ? parseDate(i.paid_date) : undefined;
      return i;
    },
  });

  var ItemList = app.ItemList = Backbone.Collection.extend({
    url: function() {
      var url = app.base + 'data.php?items';
      return url;
    },

    model: Item,
  });
  app.items = new ItemList();

  app.types = new Backbone.Collection();

  app.repeat_types = new Backbone.Collection();

  app.months = new Backbone.Collection(
    _.map([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ], function(month, i) { return {id: i+1, name: month}; })
  );

  // window.ItemTypeViewModel = kb.ViewModel.extend({
  //   constructor: function() {
  //     var self = this;
  //     kb.ViewModel.prototype.constructor.apply(this, arguments);

  //     self.repeat = ko.computed(function() {
  //       var id = self.repeat_type();
  //       return ko.utils.arrayFirst(app.viewmodel.repeat_types(), function (repeat_type) {
  //         return repeat_type.id() == id;
  //       });
  //     });
  //   },
  // });

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

        if (self.due_date() <= today) {
          if (parseFloat(self.amount()) === 0.00)
            return true;
          else if (self.automatic())
            return true;
          else if (self.paid_date() !== null && self.paid_date() <= today)
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

      self.destroy = function() {
        self.model().destroy();
      };
    },
  });

  window.AppViewModel = kb.ViewModel.extend({
    constructor: function() {
      var self = this;
      kb.ViewModel.prototype.constructor.apply(this, arguments);

      self.types = app.viewmodel.types;
      self.repeat_types = app.viewmodel.repeat_types;
      self.items = kb.collectionObservable(app.items, {factories: {models: ItemViewModel}});
      self.months = kb.collectionObservable(app.months);

      self.date = ko.observable(moment({year: app.data.year, month: app.data.month - 1}).toDate());

      self.date.subscribe(function(v) {
        var m = moment(v);
        var new_search = '?' + m.format("YYYY/M");
        if (new_search != window.location.search) {
          self.fetch();
          app.router.navigate('/' + new_search);
          self.updateTitle();
        }
      });

      self.start = function() {
        app.router.navigate('?' + moment(app.viewmodel.app.date()).format("YYYY/M"), {trigger: false, replace: true});
        self.updateTitle();
      };

      self.updateTitle = function() {
        var m = moment(self.date());
        document.title = "Bills - " + m.format("MMM YYYY");
      };

      self.month = ko.computed(function() {
        return moment(self.date()).month();
      });
      self.year = ko.computed(function() {
        return moment(self.date()).year();
      });

      self.editMode = ko.observable(false);
      self.fuzzMode = ko.observable(true);

      self.itemTemplate = function() {
        return self.editMode() ? 'edit-item-template' : 'view-item-template';
      };

      self.monthNext = function() {
        var m = moment(self.date());
        m.add(1, 'M');
        self.date(m.toDate());
      };

      self.monthPrev = function() {
        var m = moment(self.date());
        m.subtract(1, 'M');
        self.date(m.toDate());
      };

      self.fetch = function() {
        if (self.editMode()) {
          app.items.saveAll();
        }
        var m = moment(self.date());
        var d = {year: m.year(), month: m.month() + 1};
        app.items.fetch({data: d});
      };

      self.editStart = function() {
        self.editMode(true);
      };

      self.editStop = function() {
        self.editMode(false);
      };

      self.updateChart = function() {
        return app.updateChart();
      };

      self.updatePie = function() {
        return app.updatePie();
      };

      self.addItem = function() {
        var item = new Item();
        app.items.push(item);
      };

      self.duplicateItems = function() {
        var selected_items = self.selectedItems();
        var weekly_types_seen = [];
        var new_items = new ItemList();
        var current_date = moment(self.date());
        current_date.add(1, 'months');

        ko.utils.arrayForEach(selected_items, function(old_item) {
          var item = old_item.model();
          var new_item;
          var date;

          var duplicate = function(item) { /* TODO: Move to model? */
            new_item = new Item();
            new_item.set(_.clone(item.attributes));
            new_item.set('id', null);
            new_item.set('paid_date', null);
            var t = app.types.get(item.get('type_id'));
            if (t && t.get('default_value')) {
              new_item.set('amount', t.get('default_value'));
            }
            return new_item;
          };

          if (item.attributes.repeat_type == 1) {
            /* Monthly */
            new_item = duplicate(item);
            date = moment(new_item.get('due_date'));
            date.month(current_date.month());
            date.year(current_date.year());
            new_item.set('due_date', date.toDate());
            new_items.push(new_item);
          } else if (item.attributes.repeat_type == 2) {
            /* Weekly */
            if (weekly_types_seen.indexOf(item.attributes.type_id) < 0) {
              weekly_types_seen.push(item.attributes.type_id);
              date = moment(item.get('due_date'));
              while (date.month() != current_date.month()) {
                date.add(7, 'days');
              }
              while (date.month() == current_date.month()) {
                new_item = duplicate(item);
                new_item.set('due_date', date.toDate());
                new_items.push(new_item);
                date.add(7, 'days');
              }
            }
          }
        });

        Backbone.sync('create', new_items);
        return;
      };

      self.deleteItems = function() {
        var items = ko.utils.arrayFilter(self.items(), function (item) {
          return (item && item.selected());
        });
        ko.utils.arrayForEach(items, function(item) {
          item.destroy();
        });
        return;
      };

      self.selectedItems = ko.computed(function() {
        return ko.utils.arrayFilter(self.items(), function(item) {
          return (item && item.selected());
        });
      });

      self.allOrNoneItems = ko.pureComputed({
        read: function() {
          var items = self.selectedItems();
          var result = null;
          if (items.length == self.items().length) {
            result = true;
          } else if (items.length === 0) {
            result = false;
          }
          return result;
        },
        write: function(value) {
          ko.utils.arrayForEach(self.items(), function(item) {
            item.selected(value);
          });
        }
      });

      self.itemsSelected = ko.computed(function() {
        var item = ko.utils.arrayFirst(self.items(), function (item) {
          return item.selected();
        });
        return item !== null;
      });

      self.clearSelected = function() {
        ko.utils.arrayForEach(self.items(), function(item) {
          item.selected(false);
        });
      };

      self.editMode.subscribe(function(v) {
        if (!v) {
          self.clearSelected();
          app.items.saveAll();
        }
      });

    },
  });

  Backbone.Collection.prototype.saveAll = function(options) {
    // return Backbone.sync('update', this, options);
    return $.when.apply($, _.map(this.models, function(m) {
      return m.hasChanged() ? m.save(null, options).then(_.identity) : m;
    }));
  };

  var Router = Backbone.Router.extend({
    routes: {
      "(?)(:year)(/:month)": "items",
    },

    items: function(year, month) {
      if (!(year && month)) {
        year = app.data.defaultYear;
        month = app.data.defaultMonth;
      }
      app.viewmodel.app.date(moment({year: year, month: month - 1}).toDate());
      app.viewmodel.app.updateTitle();
      app.viewmodel.app.fetch();
    },
  });

  app.router = new Router();

  Backbone.history.start({
    pushState: true,
    root: "/bills/",
    silent: true,
  });
})();
