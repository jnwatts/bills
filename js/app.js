var app = window.app = window.app || {};
(function() {
  'use strict';

  app.base = $('base')[0] && $('base')[0].href || '';

  app.types = new TypeList();

  app.items = new ItemList();

  app.repeat_types = new Backbone.Collection();

  window.AppViewModel = kb.ViewModel.extend({
    constructor: function() {
      var self = this;
      kb.ViewModel.prototype.constructor.apply(this, arguments);

      self.types = kb.collectionObservable(app.types, {factories: {models: TypeViewModel}});
      self.repeat_types = app.viewmodel.repeat_types;
      self.items = kb.collectionObservable(app.items, {factories: {models: ItemViewModel}});
      self.items.comparator(function(a, b) {
        var x = a.sortDate().getTime();
        var y = b.sortDate().getTime();
        if (x == y) {
            x = a.name();
            y = b.name();
            return ( ( x == y ) ? 0 : ( ( x > y ) ? 1 : -1 ) );
        } else {
            return ( ( x > y ) ? 1 : -1 );
        }
      });
      self.months = kb.collectionObservable(app.months);

      self.date = ko.observable(moment({year: app.data.year, month: app.data.month - 1}).toDate());
      self.from = ko.observable(app.data.from);
      self.to = ko.observable(app.data.to);

      var _location = function(from, to) {
        var from = moment(from).format("YYYY/M");
        var to = moment(to).format("YYYY/M");
        if (from == to) {
          return '?' + from;
        } else {
          return '?' + from + '-' + to;
        }
      }

      self.location = ko.computed(function() {
        return _location(self.from(), self.to());
      });

      self.location.subscribe(function(v) {
        if (v != window.location.search) {
          self.fetch();
          app.router.navigate('/' + v);
        }
      });

      self.start = function() {
        app.router.navigate(self.location());
        self.fetch();
      };

      self.updateTitle = function() {
        var from = moment(self.from()).format("YYYY/M");
        var to = moment(self.to()).format("YYYY/M");
        if (from == to) {
          document.title = "Bills - " + from;
        } else {
          document.title = "Bills - " + from + " - " + to;
        }
      };

      self.month = ko.computed(function() {
        return moment(self.date()).month();
      });
      self.year = ko.computed(function() {
        return moment(self.date()).year();
      });

      self.editMode = ko.observable(false);
      self.fuzzMode = ko.observable(false);

      self.itemTemplate = function() {
        return self.editMode() ? 'edit-item-template' : 'view-item-template';
      };

      self.balance = function(i) {
        var item = self.items()[i];
        if (!item)
          return undefined;
        var balance_prev = parseFloat("0.00");
        if (i > 0) {
          var item_prev = self.items()[i-1];
          balance_prev = item_prev.balance();
        }
        var balance = parseFloat(balance_prev) + parseFloat(item.amount());
        item.balance(balance.toFixed(2));
        return item.balance();
      };

      self.monthNext = function() {
        var to = moment(self.to());
        to.add(1, 'M');
        self.to(to.toDate());
        var from = moment(self.from());
        from.add(1, 'M');
        self.from(from.toDate());
      };

      self.monthPrev = function() {
        var from = moment(self.from());
        from.subtract(1, 'M');
        self.from(from.toDate());
        var to = moment(self.to());
        to.subtract(1, 'M');
        self.to(to.toDate());
      };

      self.fetch = function() {
        if (self.editMode()) {
          app.items.saveAll();
        }
        var from = moment(self.from());
        var to = moment(self.to());
        var d = {
          'from': from.year().toString() + '-'  + (from.month() + 1).toString(),
          'to': to.year().toString() + '-'  + (to.month() + 1).toString(),
        };
        app.items.fetch({data: d});
        self.updateTitle();
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

      self.editTypes = function() {
        window.location.href = app.base + 'types.php';
      };

      self.addItem = function() {
        var item = new Item();
        app.items.push(item);
      };

      self.duplicateItems = function() {
        var selected_items = self.selectedItems();
        var weekly_types_seen = [];
        var new_items = new ItemList();
        var next_month = moment(selected_items[0].due_date());
        console.log("next_month", next_month);
        next_month.add(1, 'months');

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

          if (item.attributes.repeat_type == Type.REPEAT_MONTHLY) {
            /* Monthly */
            new_item = duplicate(item);
            date = moment(new_item.get('due_date'));
            date.month(next_month.month());
            date.year(next_month.year());
            new_item.set('due_date', date.toDate());
            new_items.push(new_item);
          } else if (item.attributes.repeat_type == Type.REPEAT_WEEKLY) {
            /* Weekly */
            if (weekly_types_seen.indexOf(item.attributes.type_id) < 0) {
              weekly_types_seen.push(item.attributes.type_id);
              date = moment(item.get('due_date'));
              while (date.month() != next_month.month()) {
                date.add(7, 'days');
              }
              while (date.month() == next_month.month()) {
                new_item = duplicate(item);
                new_item.set('due_date', date.toDate());
                new_items.push(new_item);
                date.add(7, 'days');
              }
            }
          } else if (item.attributes.repeat_type == Type.REPEAT_BIWEEKLY) {
            /* Bi-weekly */
            if (weekly_types_seen.indexOf(item.attributes.type_id) < 0) {
              weekly_types_seen.push(item.attributes.type_id);
              date = moment(item.get('due_date'));
              while (date.month() != next_month.month()) {
                date.add(14, 'days');
              }
              while (date.month() == next_month.month()) {
                new_item = duplicate(item);
                new_item.set('due_date', date.toDate());
                new_items.push(new_item);
                date.add(14, 'days');
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

  //TODO: This doesn't seem to be called from anywhere anymore? Should bisect and figure out where... possibly from long before the date->from/to migration?
  var Router = Backbone.Router.extend({
    routes: {
      "(?)(:from)-(:to)": "items_range",
      "(?)(:date)": "items",
    },

    items: function(date) {
      console.log("ROUTER:ITEMS", date);
      // if (!(year && month)) {
      //   year = app.data.defaultYear;
      //   month = app.data.defaultMonth;
      // }
      // app.viewmodel.app.fetch(date, date);
    },

    items_range: function(from, to) {
      console.log("ROUTER:ITEMS_RANGE", from, to);
      // app.viewmodel.app.fetch(from, to);
    },
  });

  app.router = new Router();

  Backbone.history.start({
    pushState: true,
    root: "/bills/",
    silent: true,
  });
})();
