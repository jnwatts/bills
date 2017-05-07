var app = angular.module('StarterApp', ['ngMaterial']);

app.directive('appEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keypress", function (e) {
            if (e.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.appEnter);
                });
            }
        });
    };
});

app.controller('AppCtrl', [
  '$scope',
  '$mdSidenav',
  '$http',
  '$mdToast',
  '$location',
  function ($scope, $mdSidenav, $http, $mdToast, $location) {
    $scope.viewsBusy = false;
    $scope.itemsBusy = false;
    $scope.months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    $scope.repeat_types = [
        {id: 0, short_name: ' ', name: "None"},
        {id: 1, short_name: 'M', name: "Monthly"},
        {id: 2, short_name: 'W', name: "Weekly"}
    ];
    $scope.types = [];
    $scope.views = [];
    $scope.view = "";
    $scope.today = function() { return new Date(); };
    $scope.month = 0;
    $scope.year = 0;
    $scope.editingItem = null;
    $scope.amount = 0;
    var uriVars = ["month", "year"];
    var uriDefaults = {month: $scope.today().getMonth() + 1, year: $scope.today().getFullYear()};
    var uriState = $location.search();
    uriVars.forEach(function (v) {
        $scope[v] = parseInt((typeof uriState[v] !== 'undefined') ? uriState[v] : uriDefaults[v]);
    });

    $scope.prevMonth = function() {
        if ($scope.month == 1) {
            $scope.year = parseInt($scope.year) - 1;
            $scope.month = 12;
        } else {
            $scope.month = parseInt($scope.month) - 1;
        }
    };

    $scope.nextMonth = function() {
        if ($scope.month == 12) {
            $scope.year = parseInt($scope.year) + 1;
            $scope.month = 1;
        } else {
            $scope.month = parseInt($scope.month) + 1;
        }
    };

    $scope.type = function(id) {
      return $scope.types.find(function (type) { return type.id == id; });
    }

    $scope.import = function() {
      $scope.itemsBusy = true;
      $scope.items = [];
      var current_date = new Date($scope.year, parseInt($scope.month) - 1, 1);
      var previous_date = new Date($scope.year, current_date.getMonth() - 1, 1);
      $http.get("data.php?items&month=" + (previous_date.getMonth() + 1) + "&year=" + previous_date.getFullYear()).then(
        function (response) {
          var weekly_types_seen = [];
          var items = response.data.map($scope.normalize);
          var new_items = [];
          items.forEach(function (item, i) {
            item.id = null;
            item.paid_date = null;

            var t = $scope.type(item.type_id);
            if (t && t.default_value) {
              item.amount = t.default_value;
            }

            if (item.repeat_type == 1) {
              /* Monthly */
              item.due_date.setMonth(current_date.getMonth());
              new_items.push($scope.denormalize(item));
            } else if (item.repeat_type == 2) {
              /* Weekly */
              if (weekly_types_seen.indexOf(item.type_id) < 0) {
                weekly_types_seen.push(item.type_id);
                while (item.due_date.getMonth() != current_date.getMonth()) {
                  item.due_date.setDate(item.due_date.getDate() + 7);
                }
                while (item.due_date.getMonth() == current_date.getMonth()) {
                  var new_item = $.extend({}, item);
                  new_item.due_date = new Date(item.due_date);
                  new_items.push($scope.denormalize(new_item));
                  item.due_date.setDate(item.due_date.getDate() + 7);
                }
              }
            }
          });
          $http.post("data.php?addInstance", new_items).then(function (response) {
            $scope.items = response.data.map($scope.normalize);
            $scope.items.forEach($scope.checkPaid);
          }, function (response) {
            $mdToast.show(
                $mdToast.simple()
                .content(response.data)
                .position("top")
                .hideDelay(3000)
                );
          });
        },function (response) {
          $mdToast.show(
              $mdToast.simple()
              .content(response.data)
              .position("top")
              .hideDelay(3000)
              );
        }
      ).finally(function () {
        $scope.itemsBusy = false;
        $scope.updateUriState();
      });
        
    };

    $scope.updateName = function(item) {
        var t = $scope.types.find(function (type) { return type.id == item.type_id; });
        if (t) {
          item.name = t.name;
        } else {
          item.name = "...";
        }
    };

    $scope.activeItem = function(item) {
        if (!$scope.editingItem)
          return false;
        return $scope.editingItem.id === item.id;
    };

    $scope.updateUriState = function() {
      uriVars.forEach(function (v) {
        $location.search(v, $scope[v]);
      });
    };

    $scope.editItem = function(item) {
      if ($scope.editingItem) {
        $scope.doneItem($scope.editingItem);
      }
      $scope.editingItem = item;
    };

    $scope.doneItem = function(item) {
      $scope.editingItem = null;
      $scope.updateItem(item);
      $scope.updateChart();
    };

    $scope.updateItem = function(item) {
      $scope.checkPaid(item);
      $http.post("data.php?updateInstance", $scope.denormalize(item)).then(function (response) {
        var result = $scope.normalize(response.data);
        $scope.items.some(function(o, i) {
            if (o.id == result.id) {
                $scope.items[i] = result;
                return true;
            }
            return false;
        });
      }, function (response) {
        $mdToast.show(
            $mdToast.simple()
            .content(response.data)
            .position("top")
            .hideDelay(3000)
            );
        e.target.value = oldValue;
      });
    };

    $scope.paidDate = function(item) {
        if (item.paid_date) {
            return item.paid_date;
        } else if (item.paid) {
            return item.due_date;
        } else {
            return null;
        }
    };

    $scope.checkPaid = function(item) {
      var today = $scope.today();
      if (item.amount === 0) {
        item.paid = true;
      } else if (item.automatic !== 0 && item.due_date <= today) {
        item.paid = true;
      } else if (item.paid_date && item.paid_date <= today) {
        item.paid = true;
      } else {
        item.paid = false;
      }
    };

    function parseDate(str) {
      if (str) {
        var y = str.substr(0,4),
            m = str.substr(5,2) - 1,
            d = str.substr(8,2);
        return new Date(y,m,d);
      } else {
        return null;
      }
    }

    function formatDate(date) {
      if (!date)
        return null;
      var d = date,
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    }
    
    $scope.updateChart = function() {
        return;
      var i;
      var series = [{data: []}];
      var data = [];
      var data_by_date = {};
      var d;

      for (i in $scope.items) {
        var item = $scope.items[i];
        d = {amount: parseFloat(item.amount), date: item.due_date};
        if (item.paid_date) {
          d.date = item.paid_date;
        }

        if (d.date in data_by_date) {
          data_by_date[d.date].amount += d.amount;
        } else {
          data_by_date[d.date] = d;
          data.push(d);
        }
      }
      data.sort(function(a, b) {
        return a.date - b.date;
      });

      var amount = $scope.amount;
      for (i in data) {
        d = data[i];
        amount += d.amount;
        series[0].data.push([Date.parse(d.date), parseFloat(amount.toFixed(2))]);
      }

      Highcharts.setOptions({global: {useUTC: false,}});
      $('#chart').highcharts({
          chart: {
              zoomType: 'x'
          },
          xAxis: {
              type: 'datetime'
          },
          yAxis: [{
          }],
          legend: {
              enabled: true
          },
          plotOptions: {
              area: {
                  marker: {
                      radius: 2
                  },
                  lineWidth: 1,
                  states: {
                      hover: {
                          lineWidth: 1
                      }
                  },
                  threshold: null
              }
          },

          series: series,
      });
    };

    $scope.pay = function(item) {
        item.paid_date = $scope.today();
        $scope.doneItem(item);
    };

    $scope.add = function(e, item) {
      $http.post("data.php?addInstance").then(function (response) {
          $scope.items.push($scope.normalize(response.data));
          });
    };

    $scope.remove = function(e, item) {
      $http.post("data.php?removeInstance", {"id": item.id}).then(function (response) {
        if (response.data.result === true) {
          var index = $scope.items.indexOf(item);
          if (index > -1) {
            $scope.items.splice(index, 1);
          }
        }
      }, function (response) {
        $mdToast.show(
            $mdToast.simple()
            .content(response.data)
            .position("top")
            .hideDelay(3000)
            );
      });
    };

    $scope.normalize = function(item) {
        var i = $.extend({}, item);
        i.repeat_type = parseInt(i.repeat_type);
        i.type_id = parseInt(i.type_id);
        i.automatic = (i.automatic != '0');
        i.amount = parseFloat(i.amount);
        i.due_date = parseDate(i.due_date);
        i.paid_date = i.paid_date ? parseDate(i.paid_date) : undefined;
        return i;
    };

    $scope.denormalize = function(item) {
        var i = $.extend({}, item);
        i.repeat_type = i.repeat_type.toString();
        i.type_id = i.type_id.toString();
        i.automatic = (i.automatic ? 'true' : 'false');
        i.amount = i.amount.toFixed(2);
        i.due_date = formatDate(i.due_date);
        i.paid_date = formatDate(i.paid_date);
        return i;
    };
    
    $scope.updateView = function() {
      $scope.itemsBusy = true;
      $scope.items = [];
      $http.get("data.php?items&month=" + $scope.month + "&year=" + $scope.year).then(
        function (response) {
          $scope.items = response.data.map($scope.normalize);
          $scope.items.forEach($scope.checkPaid);
          $scope.updateChart();
        },function (response) {
          $mdToast.show(
              $mdToast.simple()
              .content(response.data)
              .position("top")
              .hideDelay(3000)
              );
        }
      ).finally(function () {
        $scope.itemsBusy = false;
        $scope.updateUriState();
      });
    };

    $scope.toggleSidenav = function (menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.$watch("month", function(newValue, oldValue) {
      if (newValue != oldValue) {
        $scope.updateView();
      }
    });

    $scope.$watch("year", function(newValue, oldValue) {
      if (newValue != oldValue && newValue > 2000) {
        $scope.updateView();
      }
    });

    $http.get("data.php?types").then(function(response) {
         var types = response.data;
         $scope.types = [];
         types.forEach(function (type) {
           type.id = parseInt(type.id);
           type.default_value = parseFloat(type.default_value);
           $scope.types.push(type);
         });
         $scope.items.forEach($scope.updateName);
    });

    $scope.updateView();
  }
])
.config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('#');
}]);
console.warn('ARIA warnings disabled.');
var oldWarn = console.warn;
console.warn = function(m) {
  if (m.startsWith('ARIA')) return;
  oldWarn.apply(console, arguments);
};
