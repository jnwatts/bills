<!-- vim: set ts=2 sw=2 expandtab: -->
<?php require("config.php"); ?>
<html lang="en" ng-app="StarterApp">
  <head>
    <title>Bills</title>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.9.4/angular-material.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,400italic">
    <meta name="viewport" content="initial-scale=1" />
    <style>
      #blar div {
        background: blue;
      }
      table, th , td {
        border: 1px solid grey;
        border-collapse: collapse;
        padding: 5px;
      }
      tr.paid {
        color: gray;
      }
      .positive {
        color: green
      }
      .negative {
        color: red
      }
      md-toolbar input {
        color: rgba(255,255,255,0.87) !important
      }
    </style>
    <base href="<?=$config["base"]?>">
  </head>
  <body layout="column" ng-controller="AppCtrl">
    <md-toolbar layout="row">
      <div class="md-toolbar-tools">
        <h1>Bills</h1>
        <md-button class="md-icon-button md-fab md-mini" ng-click="prevMonth()">
          <md-icon md-svg-src="ic_navigate_before_white_24px.svg"></md-icon>
        </md-button>
        <md-input-container>
          <md-select ng-model="month" ng-style="{'width': '150px'}">
            <md-option ng-repeat="m in months" value="{{$index + 1}}">{{m}}</md-option>
          </md-select>
          <input type=number ng-model="year" ng-style="{'width': '150px'}">
        </md-input-container>
        <md-button class="md-icon-button md-fab md-mini" ng-click="nextMonth()">
          <md-icon md-svg-src="ic_navigate_next_white_24px.svg"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
      <div layout="column" id="content">
          <md-content layout="column" style="width: 100%" class="md-padding">
            TODO:
            <ol>
              <li>Repeat type might better belong in item itself rather than type</li>
              <li>Transform/replace PHP side with more RESTful interface compatible with Backbone/etc</li>
              <li>Consider replacing angular with Knockout (<a href="http://knockoutjs.com/examples/gridEditor.html">[1]</a>)? (Any others to consider? Backbone (for rest+model) plus <a href="http://underscorejs.org/#template">_ template</a>, <a href="https://github.com/jashkenas/backbone/wiki/Backbone%2C-The-Primer#using-views">example</a>, or maybe <a href="https://facebook.github.io/react/docs/tutorial.html">React?</a></li>
              <li>Virtual column to show balance (re-use for displaying graph!)</li>
              <li>Switch to global edit style and dirty bit (provided by angular, probably not) on changed items
                <ol>
                  <li>Using this technique (with a check-box for deletion) should allow removal of action buttons and reduce jankiness with switching edit mode of indivual lines</li>
                </ol>
              </li>
              <li>Duplication types
                <ol>
                  <li>Week-day and Month-day (any others really necessary?)</li>
                  <li>Default amount upon duplication (-1 or NULL to re-use previous value, else default?)</li>
                </ol>
              </li>
            </ol>
            <md-progress-circular md-mode="indeterminate" ng-show="itemsBusy"></md-progress-circular>
            <div ng-show="items.length == 0 && !itemsBusy">
              Nothing found: <md-button ng-click="import()">Import from previous month</md-button>
            </div>
            <div ng-show="items.length > 0" id="chart">&nbsp;</div>
            <table ng-show="items.length > 0">
            <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Due</th>
              <th>Repeat</th>
              <th>Auto</th>
              <th>Paid</th>
              <th>Notes</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr ng-repeat="item in items | orderBy: 'due_date'" ng-dblclick="editItem(item)" app-enter="doneItem(item)" ng-class="{'paid' : item.paid}" app-id="{{item.id}}">
              <td>
                <span ng-hide="activeItem(item)">{{item.name}}</span>
                <md-input-container ng-show="activeItem(item)">
                  <md-select ng-model="item.type_id" ng-change="updateName(item)">
                    <md-option ng-repeat="t in types | orderBy: 'name'" value="{{t.id}}">{{t.name}}</md-option>
                  </md-select>
                </md-input-container>
              </td>
              <td align=right>
                <span ng-hide="activeItem(item)" ng-class="{'positive' : item.amount > 0, 'negative' : item.amount < 0}"><nobr>{{item.amount | currency}}</nobr></span>
                <input ng-show="activeItem(item)" type="number" ng-model="item.amount" size="5" name="amount">
              </td>
              <td align=right>
                <span ng-hide="activeItem(item)"><nobr>{{item.due_date | date: "EEE dd"}}</nobr></span>
                <input ng-show="activeItem(item)" type="date" ng-model="item.due_date" name="due_date" required>
              </td>
              <td align="center">
                {{repeat_types[item.repeat_type].short_name}}
              </td>
              <td align="center">
                <span ng-hide="activeItem(item)">{{item.automatic ? "X" : ""}}</span>
                <input ng-show="activeItem(item)" type="checkbox" ng-model="item.automatic" name="automatic">
              </td>
              <td align="right">
                <span ng-hide="activeItem(item)"><nobr>{{paidDate(item) | date: "EEE dd"}}</nobr></span>
                <input ng-show="activeItem(item)" type="date" ng-model="item.paid_date" name="paid_date">
              </td>
              <td>
                <span ng-hide="activeItem(item)">
                  <span>{{item.notes}}</span>
                </span>
                <input ng-show="activeItem(item)" type="text" ng-model="item.notes" name="notes">
              </td>
              <td>
              <nobr>
              <md-button ng-disabled="activeItem(item)" class="md-icon-button md-fab md-mini" ng-click="editItem(item)"><md-icon md-svg-src="ic_mode_edit_white_24px.svg"></md-icon></md-button>
              <md-button ng-disabled="!activeItem(item)" class="md-icon-button md-fab md-mini" ng-click="doneItem(item)"><md-icon md-svg-src="ic_done_white_24px.svg"></md-icon></md-button>
              <md-button ng-disabled="!activeItem(item)" class="md-icon-button md-fab md-mini" ng-click="remove($event, item)"><md-icon md-svg-src="ic_delete_white_24px.svg"></md-icon></md-button>
              </nobr>
              </td>
            </tr>
            </table>
            <md-button class="md-icon-button md-fab md-mini" ng-click="add($event)"><md-icon md-svg-src="ic_add_white_24px.svg"></md-icon></md-button>
          </md-content>
      </div>
    <script src="jquery.min.js"></script>
    <script src="angular.min.js"></script>
    <script src="angular-resource.js"></script>
    <script src="angular-animate.min.js"></script>
    <script src="angular-aria.min.js"></script>
    <script src="highcharts.js"></script>
    <script src="highcharts-more.js"></script>
    <script src="angular-material.min.js"></script>
    <script src="app_angular.js"></script>
  </body>
</html>
