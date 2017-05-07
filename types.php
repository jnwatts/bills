<!-- vim: set ts=2 sw=2 expandtab: -->
<?php require("config.php"); ?>
<html lang="en" ng-app="StarterApp">
  <head>
    <title>Bill types</title>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.9.4/angular-material.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,400italic">
    <meta name="viewport" content="initial-scale=1" />
    <style>
      #blar div {
        background: blue;
      }
    </style>
    <base href="<?=$config["base"]?>">
  </head>
  <body layout="column" ng-controller="AppCtrl">
    <md-toolbar layout="row">
      <div class="md-toolbar-tools">
        <md-button ng-click="toggleSidenav('left')" hide-gt-sm class="md-icon-button">
          <md-icon aria-label="Menu" md-svg-icon="https://s3-us-west-2.amazonaws.com/s.cdpn.io/68133/menu.svg"></md-icon>
        </md-button>
        <h1>Bill Types</h1>
      </div>
    </md-toolbar>
    <div layout="row" flex>
      <md-sidenav layout="column" class="md-sidenav-left md-whiteframe-z2" md-component-id="left" md-is-locked-open="$mdMedia('gt-sm')">
        <md-progress-circular md-mode="indeterminate" ng-show="viewsBusy"></md-progress-circular>
          TODO:
          <ol>
            <li>Warn about cascading deletion!!</li>
            <li>Busy spinner</li>
          </ol>
      </md-sidenav>
      <div layout="column" id="content">
          <md-content layout="column" flex class="md-padding">
            <md-progress-circular md-mode="indeterminate" ng-show="typesBusy"></md-progress-circular>
            <div ng-show="types.length == 0 && !typesBusy">
              Nothing found: Import from previous month?
            </div>
            <table style="width: 100%" ng-show="types.length > 0">
            <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Notes</th>
              <th>URL</th>
              <th>Frequency</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr ng-repeat="type in types">
              <td><input type="text" ng-value="type.name" size=10 name="name" ng-blur="validate($event, type)"></td>
              <td><input type="text" ng-value="type.description" size=10 name="description" ng-blur="validate($event, type)"></td>
              <td><input type="text" ng-value="type.notes" size=10 name="notes" ng-blur="validate($event, type)"></td>
              <td><input type="text" ng-value="type.url" size=10 name="url" ng-blur="validate($event, type)"></td>
              <td><input type="text" ng-value="type.frequency" size=10 name="frequency" ng-blur="validate($event, type)"></td>
              <td><md-button class="md-icon-button md-fab md-mini" ng-click="remove($event, type)"><md-icon md-svg-src="ic_delete_white_24px.svg"></md-icon></md-button></td>
            </tr>
            </table>
            <md-button class="md-icon-button md-fab md-mini" ng-click="add($event)"><md-icon md-svg-src="ic_add_white_24px.svg"></md-icon></md-button>

          </md-content>
      </div>
    </div>
    <!-- Angular Material Dependencies -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-resource.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-aria.min.js"></script>

    <script src="https://ajax.googleapis.com/ajax/libs/angular_material/0.9.4/angular-material.min.js"></script>
    <script>

    var app = angular.module('StarterApp', ['ngMaterial']);
    app
    .controller('AppCtrl', [
      '$scope',
      '$mdSidenav',
      '$http',
      '$mdToast',
      '$location',
      function ($scope, $mdSidenav, $http, $mdToast, $location) {
        var uriVars = [];
        var uriDefaults = {};
        var uriState = $location.search();
        uriVars.forEach(function (v) {
            $scope[v] = (typeof uriState[v] !== 'undefined') ? uriState[v] : uriDefaults[v];
        });

        $scope.typesBusy = false;

        $scope.updateUriState = function() {
          uriVars.forEach(function (v) {
            $location.search(v, $scope[v]);
          });
        };

        $scope.validate = function(e, item) {
          var column = e.target.name;
          var newValue = e.target.value;
          var oldValue = item[column];
          if (oldValue !== newValue) {
            $http.post("data.php?editType", {"id": item.id, "column": column, "value": newValue}).then(function (response) {
              e.target.value = item[column] = response.data.value;
            }, function (response) {
              $mdToast.show(
                  $mdToast.simple()
                  .content(response.data)
                  .position("top")
                  .hideDelay(3000)
                  );
              e.target.value = oldValue;
            });
          }
        };

        $scope.add = function(e, item) {
          $http.post("data.php?addType").then(function (response) {
            $scope.types.push(response.data);
          });
        };

        $scope.remove = function(e, item) {
          $http.post("data.php?removeType", {"id": item.id}).then(function (response) {
            if (response.data.result === true) {
              var index = $scope.types.indexOf(item);
              if (index > -1) {
                $scope.types.splice(index, 1);
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

        $scope.fillTypes = function () {
          $scope.typesBusy = true;
          $http.get("data.php?types").then(
            function(response) {
              $scope.types = response.data;
            },function(response) {
            $mdToast.show(
                $mdToast.simple()
                .content(response.data)
                .position("top")
                .hideDelay(3000)
                );
            }
          ).finally(function () {
            $scope.typesBusy = false;
          });
        };
        
        $scope.toggleSidenav = function (menuId) {
          $mdSidenav(menuId).toggle();
        };


        $scope.fillTypes();
      }
    ])
    .config(['$locationProvider', function ($locationProvider) {
      $locationProvider.html5Mode(true).hashPrefix('#');
    }]);
    </script>
  </body>
</html>
