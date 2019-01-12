<!-- vim: set ts=2 sw=2 expandtab: -->
<?php require("config.php"); ?>
<html lang="en" ng-app="StarterApp">
  <head>
    <title>Bills - Types</title>
    <link rel="stylesheet" type="text/css" href="css/lib/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="css/lib/bootstrap-toggle.min.css">
    <link rel="stylesheet" type="text/css" href="css/bootstrap-toggle-fixup.css">
    <link rel="stylesheet" type="text/css" href="css/app.css">
    <base href="<?=$config["base"]?>">
  </head>
  <body>
    <div id="busy"></div>

    <div id="toolbar">
      <h1>
        <a href="">Bills</a> - Types
      </h1>
      <button data-bind="click: saveTypes">Save</button>
      <button data-bind="click: addType">Add</button>
      <button data-bind="click: deleteTypes, enable: typesSelected">Delete</button>
    </div><!-- toolbar -->

    <script type="text/html" id="edit-type-template">
      <tr class="edit">
        <td class="operations"><input type="checkbox" data-bind="checked: selected"></td>
        <td class="name"><input type="text" data-bind="value: name"></td></td>
        <td class="default_value"><input type="text" class="currency" data-bind="value: default_value"></td>
        <td class="repeat"><select data-bind="options: $root.repeat_types, optionsValue: 'id', optionsText: 'name', value: repeat_type"></select></td>
        <td class="description"><input type="text" data-bind="value: description"></td></td>
        <td class="notes"><input type="text" data-bind="value: notes"></td></td>
        <td class="url"><input type="text" data-bind="value: url"></td></td>
      </tr>
    </script>


    <div id="content">
      <table id="types">
        <thead>
          <tr>
            <th><input type="checkbox" data-bind="triState: allOrNoneTypes"></th>
            <th>Name</th>
            <th>Default Value</th>
            <th>Repeat</th>
            <th>Description</th>
            <th>Notes</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody data-bind="template: { name: typeTemplate, foreach: types() }">
        </tbody>
      </table>
    </div><!-- content -->

    <script type="text/javascript">
(function() {
  'use strict';

  var app = window.app = window.app || {};
  app.data = {
    types: [],
  };

})();
    </script>

    <script type="text/javascript" src="js/lib/jquery.min.js"></script>
    <script type="text/javascript" src="js/lib/jquery.maskMoney.js"></script>
    <script type="text/javascript" src="js/lib/knockback-full-stack.js"></script>
    <script type="text/javascript" src="js/lib/moment.min.js"></script>
    <script type="text/javascript" src="js/lib/knockout-tristate.js"></script>
    <script type="text/javascript" src="js/lib/popper.min.js"></script>
    <script type="text/javascript" src="js/lib/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/lib/bootstrap-toggle.js"></script>
    <script type="text/javascript" src="js/bootstrap-toggle.js"></script>
    <script type="text/javascript" src="js/format.js"></script>
    <script type="text/javascript" src="js/type.js"></script>
    <script type="text/javascript" src="js/app_types.js"></script>
    <script type="text/javascript">
(function() {
  'use strict';

  app.repeat_types.reset(Type.repeat_types);
  app.viewmodel = {};
  app.viewmodel.repeat_types = kb.collectionObservable(app.repeat_types);
  app.viewmodel.types = kb.collectionObservable(app.types);
  app.viewmodel.app = new AppViewModel();
  app.viewmodel.app.fetch();
  kb.applyBindings(app.viewmodel.app, $('body')[0]);

  $('#busy').fadeOut({duration: 250});

  $.ajaxSetup({
      beforeSend:function(){
          // show gif here, eg:
          $("#busy").show();
      },
      complete:function(){
          // hide gif here, eg:
          $('#busy').fadeOut({duration: 250});
      }
  });

})();
    </script>
  </body>
</html>
