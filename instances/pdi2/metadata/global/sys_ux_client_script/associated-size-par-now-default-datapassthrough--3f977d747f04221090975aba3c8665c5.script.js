/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.associatedTableStats) return [];

    var {
        size,
        growthPercent,
        baseScoreDate
    } = api.state.associatedTableStats;

    if (size == undefined)
        return [];

    var previousValue = size / (1 + growthPercent / 100);
    var delta = size - previousValue;

    let changeArrow = growthPercent > 0 ? "up" : growthPercent < 0 ? "down" : "steady";

    return [{
        "data": [{
            "value": size,
            "change": delta.toString(),
            "changePercent": growthPercent.toString()
        }],
        "metadata": {
            "previousScoreDate": baseScoreDate && baseScoreDate.toString(),
            "changeArrow": changeArrow,
            "format": {
                "unitFormat": "{0}",
                "frequency": "daily",
                "precision": 2
            }
        }
    }];
}
