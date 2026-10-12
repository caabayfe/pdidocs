/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.tableStats)
        return [];
    
    var {
        size,
        growthPercent,
        baseScoreDate
    } = api.state.tableStats;
    if (size == undefined)
        return [];

    var previousValue = size / (1 + growthPercent / 100);
    var delta = size - previousValue;

    var changeArrow = growthPercent > 0 ? "up" : growthPercent < 0 ? "down" : "steady";

    return [{
        "data": [{
            "value": size,
            "change": delta.toString(),
            "changePercent": growthPercent.toString()
        }],
        "metadata": {
            "changeArrow": changeArrow,
            "previousScoreDate": baseScoreDate.toString(),
            "format": {
                "unitFormat": "{0}",
                "frequency": "daily",
                "precision": 2
            }
        }
    }];
}
