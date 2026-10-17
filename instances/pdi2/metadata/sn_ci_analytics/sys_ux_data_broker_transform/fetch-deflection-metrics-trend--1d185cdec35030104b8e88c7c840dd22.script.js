function transform(input) {

    function _getMetricCount(startDate, endDate, deflectionConfiguration) {
        var count = 0;
        var ga = new GlideAggregate("ssa_deflection_metric");
        var query = "deflection_pattern.deflection_configuration=" + deflectionConfiguration.toString() + "^sys_created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";
        ga.addEncodedQuery(query, true);
        ga.addQuery('type', '!=', '10');
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next())
            count = parseInt(ga.getAggregate('COUNT'));
        return count;
    }

    function _getRecordsTrend(startDate, endDate, deflectionConfiguration) {
        var ga = new GlideAggregate("ssa_deflection_metric");
        var query = "deflection_pattern.deflection_configuration=" + deflectionConfiguration.toString() + "^sys_created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";
        ga.addEncodedQuery(query, true);
        ga.addQuery('type', '!=', '10');
        ga.addAggregate('COUNT');
        ga.addTrend('sys_created_on', 'date');
        ga.query();
        var recordsTrend = {};
        while (ga.next()) {
            var date = new GlideDateTime(ga.getValue("timeref")).getDate();
            recordsTrend[date] = parseInt(ga.getAggregate('COUNT'));
        }
        return recordsTrend;
    }

    function _generateChartData(startDate, endDate, deflectionConfiguration, vaUtils) {
        var deflectionTrendSeries = _getRecordsTrend(startDate, endDate, deflectionConfiguration);
        if (vaUtils.isEmpty(deflectionTrendSeries)) return [];
        var dateBucket = vaUtils.getBucketType(vaUtils.getDays(startDate, endDate));
        deflectionTrendSeries = vaUtils.addMissingDates(startDate, endDate, deflectionTrendSeries, dateBucket);
        var result = vaUtils.transformTimeSeries(deflectionTrendSeries);
        return result || [];
    }

    function preparePARPayload(currentMetricCount, previousMetricCount, chartData, vaUtils, startDate) {
        chartData.map(function(data) {
            data["value"] = data["y0"] + "";
            data["timestamp"] = data["timestamp"] + "";
        });
        var countDiff = currentMetricCount - previousMetricCount;
        var arrow = "steady";
        if (countDiff < 0) {
            arrow = "down";
        } else if (countDiff > 0) {
            arrow = "up";
        }

        var changePercent = previousMetricCount === 0 ? '' : ((countDiff / previousMetricCount) * 100).toFixed(0);

        return [{
            "data": [{
                "value": currentMetricCount,
                "change": Math.abs(currentMetricCount - previousMetricCount),
                "changePercent": changePercent,
            }],
            "metadata": {
                "eventData": {},
                "previousScoreDate": new GlideDateTime(startDate).getNumericValue() + "",
                "changeArrow": arrow,
                "scoreDate": new GlideDateTime(startDate).getNumericValue() + "",
                "aggregate": {
                    "fieldType": "decimal"
                },
                "format": {
                    "unitFormat": "{0}",
                    "frequency": "daily",
                    "precision": 0
                }
            },
            "sparkline": {
                "data": chartData,
                "metadata": {
                    "series": [{
                        "label": "Number of total deflections",
                        "id": "value",
                        "type": "value"
                    }],
                    "aggregate": {
                        "fieldType": "decimal"
                    },
                    "format": {
                        "unitFormat": "{0}",
                        "frequency": "daily",
                        "precision": 0
                    }
                }
            }
        }]
    }

    try {
        var result = {
            total_deflection_metrics_count: 0,
            change: '',
            chart_data: [],
            parPayload: []
        };

        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date) || !input.deflection_configuration) {
            return result;
        }
        var fromDate = input.from_date;
        var toDate = input.to_date;
        var deflectionConfiguration = input.deflection_configuration;
        var previousPeriod = vaUtils.getPreviousPeriod(fromDate, toDate);

        var currentMetricCount = _getMetricCount(fromDate, toDate, deflectionConfiguration);
        var previousMetricCount = _getMetricCount(previousPeriod.fromDate, previousPeriod.toDate, deflectionConfiguration);
        var changeText = vaUtils.getChangeInfoTextForScoreCard(currentMetricCount, previousMetricCount);
        var chartData = _generateChartData(fromDate, toDate, deflectionConfiguration, vaUtils);
        var parPayload = preparePARPayload(currentMetricCount, previousMetricCount, chartData, vaUtils, fromDate);

        result = {
            total_deflection_metrics_count: currentMetricCount + '',
            change: changeText,
            chart_data: chartData,
            parPayload: parPayload
        };

    } catch (e) {
        gs.error('VA Analytics Deflection Widget Data broker - Error fetching deflection metric count: ' + e);
    }

    return result;
}
