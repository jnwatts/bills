var app = window.app = window.app || {};
(function() {
  'use strict';

  app.updateChart = function() {
    var i;
    var series = [{data: []}];
    var data = [];
    var data_by_date = {};
    var d;

    app.items.each(function(item) {
      d = {amount: parseFloat(item.get('amount')), date: item.get('due_date')};
      if (item.get('paid_date')) {
        d.date = item.get('paid_date');
      }

      if (d.date in data_by_date) {
        data_by_date[d.date].amount += d.amount;
      } else {
        data_by_date[d.date] = d;
        data.push(d);
      }
      // console.log(d.date, data_by_date[d.date].amount);
    });
    data.sort(function(a, b) {
      return a.date - b.date;
    });

    var amount = 0;
    _.each(data, function(d) {
      amount += d.amount;
      series[0].data.push([Date.parse(d.date), parseFloat(amount.toFixed(2))]);
    });

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

    $('#chart').show();
  };


})();