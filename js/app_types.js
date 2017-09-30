var app = window.app = window.app || {};
(function() {
  'use strict';

  app.base = $('base')[0] && $('base')[0].href || '';

  app.types = new TypeList();

  app.repeat_types = new Backbone.Collection();

  window.AppViewModel = kb.ViewModel.extend({
    constructor: function() {
      var self = this;
      kb.ViewModel.prototype.constructor.apply(this, arguments);

      self.types = kb.collectionObservable(app.types, {factories: {models: TypeViewModel}});
      self.repeat_types = app.viewmodel.repeat_types;

      self.typeTemplate = function() {
        return 'edit-type-template';
      };

      self.fetch = function() {
        app.types.fetch();
      };

      self.saveTypes = function() {
        app.types.saveAll();
      };

      self.addType = function() {
        var type = new Type();
        app.types.push(type);
      };

      self.deleteTypes = function() {
        var types = ko.utils.arrayFilter(self.types(), function (type) {
          return (type && type.selected());
        });
        ko.utils.arrayForEach(types, function(type) {
          type.destroy();
        });
        return;
      };

      self.selectedTypes = ko.computed(function() {
        return ko.utils.arrayFilter(self.types(), function(type) {
          return (type && type.selected());
        });
      });

      self.allOrNoneTypes = ko.pureComputed({
        read: function() {
          var types = self.selectedTypes();
          var result = null;
          if (types.length == self.types().length) {
            result = true;
          } else if (types.length === 0) {
            result = false;
          }
          return result;
        },
        write: function(value) {
          ko.utils.arrayForEach(self.types(), function(type) {
            type.selected(value);
          });
        }
      });

      self.typesSelected = ko.computed(function() {
        var type = ko.utils.arrayFirst(self.types(), function (type) {
          return type.selected();
        });
        return type !== null;
      });

      self.clearSelected = function() {
        ko.utils.arrayForEach(self.types(), function(type) {
          type.selected(false);
        });
      };
    },
  });

  Backbone.Collection.prototype.saveAll = function(options) {
    // return Backbone.sync('update', this, options);
    return $.when.apply($, _.map(this.models, function(m) {
      return m.hasChanged() ? m.save(null, options).then(_.identity) : m;
    }));
  };

})();
