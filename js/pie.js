var app = window.app = window.app || {};
(function() {
  'use strict';

  app.updatePie = function() {
    var i;
    var data = [];
    var total = 0.0;
    var remaining;

    app.items.each(function(item) {
      var type_id = item.get('type_id');
      var type = app.types.get(type_id);
      var type_name = type.get('name');
      var amount = item.get('amount');


      var d = {y: parseFloat(amount), name: type_name};

      if (type_id == 2) {
        // BALANCE
      } else if (d.y < 0) {
        data.push(d);
      } else {
        total += d.y;
      }
      console.log(item.get('id'), type_id, type_name, amount, total);
    });

    remaining = total;

    data.forEach(function(d) {
      remaining += d.y;
      d.name = d.name + ' $' + parseInt(-d.y);
      d.y = -d.y / total * 100.0;
    });

    data.sort(function(a, b) {
      return b.y - a.y;
    });

    data.push({y: remaining / total * 100.0, name: 'free $' + parseInt(remaining)});

    Highcharts.getOptions().plotOptions.pie.colors = (function () {
			var colors = [],
				base = Highcharts.getOptions().colors[0],
				i;

			for (i = 0; i < data.length; i += 1) {
				// Start out with a darkened base color (negative brighten), and end
				// up with a much brighter color
				colors.push(Highcharts.Color(base).brighten((i - (data.length * 0.80)) / (data.length * 1.2)).get());
			}
			return colors;
    }());

    $('#pie').highcharts({
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Expenditures'
      },
      tooltip: {
        pointFormat: '{series.name}<br><b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        name: '',
        colorByPoint: true,
        data: data
      }]
    });

    $('#pie').show();
  };
})();
