<!-- vim: set ts=2 sw=2 expandtab: -->
<?php
require("config.php");
require("items-class.php");
?>
<html lang="en" ng-app="StarterApp">
  <head>
    <title>Bills</title>
    <link rel="stylesheet" type="text/css" href="app.css">
    <base href="<?=$config["base"]?>">
  </head>
  <body>
    <div id="items_busy"></div>

    <div>
      TODO:
      <ol>
        <li>Next/prev loading is broken... month changes, but data set does not. :-(</li>
        <li>Update chart/pie after major changes (use settimeout and dirty flag to prevent multiple refreshes)</li>
        <li>Save isn't 100% sync: After successful save, edit/unedit will re-sync same (not further modified) items.. check bbjs' changedAttributes()?</li>
        <li>What is /actually/ changing on everything... every save updates every single friggin' item.</li>
        <li>Transform/replace PHP side with more RESTful interface compatible with Backbone/etc</li>
        <li>Knockback is working well, but if not, maybe <a href="https://facebook.github.io/react/docs/tutorial.html">React?</a></li>
        <li>Virtual column to show balance (re-use for displaying graph!)</li>
      </ol>
    </div>

    <table id="charts">
    <tr>
    <td><div id="chart" style="display: none">&nbsp;</div></td>
    <td><div id="pie" style="display: none">&nbsp;</div></td>
    </tr>
    </table><!-- charts -->

    <div id="toolbar">
      <h1>
        Bills
      </h1>
      <button data-bind="click: monthPrev">
        <img src="ic_navigate_before_black_24px.svg">
      </button>
<!--
      <select data-bind="options: months, optionsValue: 'id', optionsText: 'name', value: month"></select>
      <input type="number" data-bind="value: year">
-->
      <!-- <span data-bind="datePicker: date"></span> -->
      <input type="month" data-bind="monthPicker: date">
      <button data-bind="click: monthNext">
        <img src="ic_navigate_next_black_24px.svg"></img>
      </button>
    </div><!-- toolbar -->

    <datalist id="types" data-bind="foreach: types">
        <option data-bind="value: id, text: name"></option>
    </datalist>

    <script type="text/html" id="view-item-template">
      <tr class="view" data-bind="css: {paid: paid(), unpaid: unpaid(), late: late(), zero: amount() == 0}, event: { dblclick: $root.editStart }">
        <td cass="operations"><div class="placeholder"></div></td>
        <td class="name" data-bind="text: name"></td>
        <td class="amount" data-bind="css: {negative: amount() < 0, positive: amount() > 0, fuzzed: $root.fuzzMode()}, text: formatCurrency(amount())"></td>
        <td class="due_date" data-bind="text: formatDate(due_date())"></td>
        <td class="repeat" data-bind="text: repeat_type().short_name()"></td>
        <td class="automatic" data-bind="text: automatic() ? 'X' : ''"></td>
        <td class="paid_date" data-bind="text: automatic() ? '' : formatDate(paidDate())"></td>
        <td class="notes" data-bind="text: notes"></td>
      </tr>
    </script>
    <script type="text/html" id="edit-item-template">
      <tr class="edit" data-bind="css: {paid: paid(), unpaid: unpaid(), late: late(), zero: amount() == 0, automatic: automatic()}">
        <td class="operations"><input type="checkbox" data-bind="checked: selected"></td>
        <td class="name">
        <!-- <input type="text" data-bind="value: type_id" list="types"></td> -->
        <select data-bind="options: $root.types, optionsValue: 'id', optionsText: 'name', value: type_id"></select>
        </td>
        <td class="amount"><input type="text" class="currency" data-bind="css: {negative: amount() < 0, positive: amount() > 0}, value: amount"></td>
        <td class="due_date"><input type="date" data-bind="datePicker: due_date"></td>
        <td class="repeat" data-bind="text: repeat_type().short_name()"></td>
        <td class="automatic"><input type="checkbox" data-bind="checked: automatic"></td>
        <td class="paid_date"><input type="date" data-bind="datePicker: paid_date"></td>
        <td class="notes"><div><input type="text" data-bind="value: notes"></div></td>
      </tr>
    </script>

    <div>
      <button data-bind="click: updateChart">Chart</button>
      <button data-bind="click: updatePie">Pie</button>
      <button data-bind="click: addItem">Add</button>
      <button data-bind="click: duplicateItems, enable: itemsSelected">Duplicate</button>
      <button data-bind="click: deleteItems, enable: itemsSelected">Delete</button>
      <label>
        <input type="checkbox" data-bind="checked: editMode">
        Edit
      </label>
      <label>
        <input type="checkbox" data-bind="checked: fuzzMode">
        Fuzz
      </label>
    </div>

    <div id="content">
      <table id="items" data-bind="visible: items().length > 0">
        <thead>
          <tr>
            <th><input type="checkbox" data-bind="visible: editMode, triState: allOrNoneItems"></th>
            <th>Name</th>
            <th>Amount</th>
            <th>Due</th>
            <th>Repeat</th>
            <th>Auto</th>
            <th>Paid</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody data-bind="template: { name: itemTemplate, foreach: items() }">
        </tbody>
      </table>
    </div><!-- content -->

<?php
$items = new Items($config);

$defaultYear = $items->defaultYear();
$defaultMonth = $items->defaultMonth();

$year = $defaultYear;
$month = $defaultMonth;

$m = array();
if (preg_match('#([0-9]{4})/?([0-9]{0,2})?#', $_SERVER['QUERY_STRING'], $m)) {
  if (!empty($m[1])) {
    $year = (int)$m[1];
  }
  if (!empty($m[2])) {
    $month = (int)$m[2];
  }
}

?>

    <script type="text/javascript">
(function() {
  'use strict';
  var app = window.app = window.app || {};
  app.data = {
    repeat_types: [
      {id: 0, short_name: ' ', name: "None"},
      {id: 1, short_name: 'M', name: "Monthly"},
      {id: 2, short_name: 'W', name: "Weekly"}
    ],
    types: <?=json_encode($items->types())?>,
    items: <?=json_encode($items->items($year, $month))?>,
    year: <?=$year?>,
    month: <?=$month?>,
    defaultYear: <?=$defaultYear?>,
    defaultMonth: <?=$defaultMonth?>,
  };
})();
    </script>

    <script type="text/javascript" src="jquery.min.js"></script>
    <script type="text/javascript" src="jquery.maskMoney.js"></script>
    <script type="text/javascript" src="knockback-full-stack.js"></script>
    <script type="text/javascript" src="highcharts.js"></script>
    <script type="text/javascript" src="highcharts-more.js"></script>
    <script type="text/javascript" src="moment.min.js"></script>
    <script type="text/javascript" src="knockout-tristate.js"></script>
    <script type="text/javascript" src="chart.js"></script>
    <script type="text/javascript" src="pie.js"></script>
    <script type="text/javascript" src="app.js"></script>
    <script type="text/javascript">
(function() {
  'use strict';
  
  app.repeat_types.reset(app.data.repeat_types);
  app.types.reset(app.data.types);
  app.items.reset(app.data.items.map(app.Item.prototype.parse));
  app.viewmodel = {};
  app.viewmodel.repeat_types = kb.collectionObservable(app.repeat_types);
  app.viewmodel.types = kb.collectionObservable(app.types);
  app.viewmodel.app = new AppViewModel();
  kb.applyBindings(app.viewmodel.app, $('body')[0]);
  

  $('body').on('keyup', function(e) {
    if (e.keyCode == 27) {
      app.viewmodel.editMode(false);
    }
  });

  $('#items_busy').fadeOut({duration: 250});

  $(".currency").maskMoney({allowNegative: true, thousands:',', decimal:'.', affixesStay: false});


  $.ajaxSetup({
      beforeSend:function(){
          // show gif here, eg:
          $("#items_busy").show();
      },
      complete:function(){
          // hide gif here, eg:
          $('#items_busy').fadeOut({duration: 250});
      }
  });

  app.viewmodel.app.start();

  setTimeout(function() { app.updateChart(); app.updatePie(); }, 750);
})();
    </script>
  </body>
</html>