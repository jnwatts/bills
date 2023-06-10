var app = window.app = window.app || {};
(function() {
  'use strict';

  app.updateChart = function() {
    var i;
    var series = [
        {
            name: 'Min/max',
            type: 'columnrange',
            data: [],
        },
        {
            name: 'Average',
            data: [],
        },
    ];
    var data = [];
    var data_by_date = {};
    var d;

    app.items.each(function(item) {
      d = {min: 0, max: 0, amount: parseFloat(item.get('balance')), date: item.get('due_date')};
      if (item.get('paid_date')) {
        d.date = item.get('paid_date');
      }

      if (d.date in data_by_date) {
        data_by_date[d.date].min = Math.min(d.amount, data_by_date[d.date].min);
        data_by_date[d.date].max = Math.max(d.amount, data_by_date[d.date].max);
      } else {
        d.min = d.amount;
        d.max = d.amount;
        data_by_date[d.date] = d;
        data.push(d);
      }
    });
    data.sort(function(a, b) {
      return a.date - b.date;
    });

    var amount = 0;
    _.each(data, function(d) {
      if (d.min == d.max) {
        series[1].data.push([Date.parse(d.date), d.min]);
      } else {
        series[0].data.push([Date.parse(d.date), d.min, d.max]);
        series[1].data.push([Date.parse(d.date), (d.min+d.max)/2]);
      }
    });

    Highcharts.setOptions({global: {useUTC: false,}});
    $('#chart').highcharts({
        chart: {
            zoomType: 'x'
        },
        tooltip: {
            formatter: function() {
                var date = window.formatDate(new Date(this.point.x));
                if (this.point.low && this.point.high) {
                    return date + ": " + this.point.low.toFixed(2) + " — " + this.point.high.toFixed(2);
                }
                return date + " " + this.point.y.toFixed(2);
            },
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: [
            {},
            {},
        ],
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