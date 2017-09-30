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

      self.date.subscribe(function(v) {
        var m = moment(v);
        var new_search = '?' + m.format("YYYY/M");
        if (new_search != window.location.search) {
          self.fetch();
          app.router.navigate('/' + new_search);
        }
      });

      self.start = function() {
        app.router.navigate('?' + moment(app.viewmodel.app.date()).format("YYYY/M"), {trigger: false, replace: true});
        self.fetch();
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

      self.fetch = function(year, month) {
        if (self.editMode()) {
          app.items.saveAll();
        }
        if (year && month) {
          self.date(new Date(year, month - 1, 1));
        }
        var m = moment(self.date());
        var d = {'date': m.year().toString() + '-'  + (m.month() + 1).toString()};
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
      app.viewmodel.app.fetch(year, month);
    },
  });

  app.router = new Router();

  Backbone.history.start({
    pushState: true,
    root: "/bills/",
    silent: true,
  });
})();
