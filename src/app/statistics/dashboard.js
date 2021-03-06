angular.module('stats').controller('DashboardCtrl', function($scope, scripts) {
  $scope.scripts = scripts;

  function aggregateScriptSales(beginTime, endTime, script) {
    var data = {};

    data.revenue = _.chain(script.purchases)
      .filter(function(purchase) {
        return moment(purchase.purchase_time * 1000).isBetween(
          beginTime,
          endTime
        );
      })
      .tap(function(filtered) {
        data.amountSold = filtered.length;
      })
      .pluck('price')
      .reduce(_.add)
      .value();

    return data;
  }

  $scope.performance = {
    lastMonth: { scripts: [], total: {} },
    thisMonth: { scripts: [], total: {} },
  };

  for (var i = 0; i < scripts.length; i++) {
    $scope.performance.lastMonth.scripts[i] = aggregateScriptSales(
      moment().subtract(1, 'M').startOf('month'),
      moment().subtract(1, 'M').endOf('month'),
      scripts[i]
    );
    $scope.performance.lastMonth.scripts[i].script = $scope.scripts[i];
    $scope.performance.lastMonth.date = moment()
      .subtract(1, 'M')
      .startOf('month');

    $scope.performance.thisMonth.scripts[i] = aggregateScriptSales(
      moment().startOf('month'),
      moment(),
      scripts[i]
    );
    $scope.performance.thisMonth.scripts[i].script = $scope.scripts[i];
  }

  function reduceParam(scriptsData, param) {
    return _.chain(scriptsData).pluck(param).reduce(_.add).value();
  }

  function calculateTotals(dataBasis) {
    return {
      revenue: reduceParam(dataBasis.scripts, 'revenue'),
      amountSold: reduceParam(dataBasis.scripts, 'amountSold'),
    };
  }

  $scope.performance.lastMonth.total = calculateTotals(
    $scope.performance.lastMonth
  );
  $scope.performance.thisMonth.total = calculateTotals(
    $scope.performance.thisMonth
  );

  $scope.salesGraphData = $scope.performance.thisMonth.scripts;

  $scope.salesGraphOptions = {
    chart: {
      type: 'pieChart',
      height: 300,
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      showLegend: false,
      x: function(d) {
        return d.script.name;
      },
      y: function(d) {
        return d.revenue || 0;
      },
      showValues: false,
      valueFormat: function(d) {
        return d3.format('$,.2f')(d);
      },
      duration: 4000,
    },
  };
});
