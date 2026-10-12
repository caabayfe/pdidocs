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
    var frequency = (trendFrequency == "MONTH") ? "monthly" : "weekly";
    
    // Trends Object to return
    var trends = [];

    const tableStats = api.state.tableStats;
    var tableTrendData = [];
    if (tableStats && tableStats.trends && tableStats.trends.length > 0) {
        var selectedTrend = tableStats.trends.filter(trend => (trend.frequency == trendFrequency));
        if (selectedTrend.length > 0) {
            tableTrendData = selectedTrend[0].storageUsages;
            
            // Got Table Storage Usage Trend
            trends.push({
                data: tableTrendData,
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
                        label: helpers.translateSync("Table size"),
                        type: "value"
                    }]
                }
            });
        }
    }


    var associatedStats = api.state.associatedTableStats;
    var associatedTrendData = [];
    if (associatedStats && associatedStats.trends && associatedStats.trends.length > 0) {
        var selectedAssociatedTrend = associatedStats.trends.filter(trend => (trend.frequency == trendFrequency));
        if (selectedAssociatedTrend.length > 0) {
            associatedTrendData = selectedAssociatedTrend[0].storageUsages;
            
            //Got Associated Table Size Trend
            trends.push({
                data: associatedTrendData,
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
                        label: helpers.translateSync("Associated record size"),
                        type: "value"
                    }]
                }
            });
        }
    }
    return trends;
}
