/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var trendFrequency = api.state.trendFrequency;
    var frequency = trendFrequency == "MONTH" ? "monthly" : "weekly";

    /** Get Trend of Database Primary Storage Usage Stats */

    var selectedDBTrendData = [];
    var dbSizeTrendTrendData = api.state.primaryStorageStats.trends;
    if (dbSizeTrendTrendData && dbSizeTrendTrendData.length > 0) {
        var selectedTrend = dbSizeTrendTrendData.filter(data => data.frequency == trendFrequency);
        if (selectedTrend.length > 0) {
            selectedDBTrendData = selectedTrend[0].storageUsages;
        }
    }

    var dbSizeTrend = [{
        data: selectedDBTrendData,
        metadata: {
            timeZone: "SESSION",
            aggregate: {
                fieldType: "decimal"
            },
            format: {
                frequency: frequency,
                precision: 0,
                unitFormat: "{0}"
            },
            series: [{
                id: "value",
                label: helpers.translateSync("Total size"),
                type: "value"
            }]
        }
    }];


    /** Get Trend of Top 10 tables by Size */

    var topTableTrendsData = [];
    var topTablesBySizeTrend = api.context.props.top10LargestTableTrend;
    if (topTablesBySizeTrend && topTablesBySizeTrend.length > 0) {
        topTableTrendsData = topTablesBySizeTrend.filter(trend => trend.frequency == trendFrequency).map(trendData => {
            return {
                data: trendData.storageUsages,
                metadata: {
                    timeZone: "SESSION",
                    aggregate: {
                        fieldType: "decimal"
                    },
                    format: {
                        frequency: frequency,
                        precision: 0,
                        unitFormat: "{0}"
                    },
                    series: [{
                        id: "value",
                        label: trendData.label,
                        type: "value"
                    }]
                }
            };
        });
    }




    var trend = dbSizeTrend.concat(topTableTrendsData);
    return trend;
}
