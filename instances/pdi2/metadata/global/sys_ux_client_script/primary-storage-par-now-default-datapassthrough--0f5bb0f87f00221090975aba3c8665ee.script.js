/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var {
        size,
        growthPercent,
        baseScoreDate,
        trends
    } = api.state.primaryStorageStats;

    if (size == undefined)
        return [];

    var previousValue = size / (1 + growthPercent / 100);
    var delta = size - previousValue;

    var changeArrow = growthPercent > 0 ? "up" : growthPercent < 0 ? "down" : "steady";

    // get daily trends to be shown as sparkline in card  
    var dailyTrends = trends.filter(trend => trend.frequency == "DAY");
    var dailyStorageUsages = [];
    if (dailyTrends.length) {
        dailyStorageUsages = dailyTrends[0].storageUsages;
    }

    return [{
        "data": [{
            "value": size,
            "change": delta.toString(),
            "changePercent": growthPercent.toString()
        }],
        "metadata": {
            "changeArrow": changeArrow,
            "previousScoreDate": baseScoreDate && baseScoreDate.toString(),
            "format": {
                "unitFormat": "{0}",
                "frequency": "daily",
                "precision": 2
            }
        },
        "sparkline": {
            "data": dailyStorageUsages,
            "metadata": {

                "series": [{
                    "label": helpers.translateSync("Primary storage usage"),
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
    }];
}
