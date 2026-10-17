/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var maxMem = api.data.mid_server_performance_metrics_lookup.results[0].max_memory.value;
    var yesterdayMaxMem = api.data.mem_yesterday_avg.output.data.GlideAggregate_Query[0].avg;
    var change = maxMem - yesterdayMaxMem;
    var changePercentage = (change / yesterdayMaxMem) * 100;
    var currentDate = api.data.current_now_datetime.output.numericValue;
    var yesterdayDate = api.data.yesterday_now_datetime.output.numericValue;
    var changeArrowValue;
    if (change > 0) {
        changeArrowValue = 'up';
    } else if (change < 0) {
        changeArrowValue = 'down';
        change = change * -1;
    } else {
        changeArrowValue = 'steady';
    }

    return [{
        "data": [{
            "change": change,
            "value": maxMem
        }],
        "metadata": {
            "aggregate": {
                "fieldType": "percentage"
            },
            "changeArrow": changeArrowValue,
            "dataSourceLabel": "MID Server Memory Usage",
            "filterQuery": "opened_atONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^ORopened_at<javascript:gs.beginningOfToday()^resolved_atISEMPTY^ORresolved_at>javascript:gs.endOfToday()^state!=8",
            "format": {
                "frequency": "daily",
                "precision": 1,
                "unitFormat": "{0}%"
            },
            "previousScoreDate": yesterdayDate.toString(),
            "scoreDate": currentDate.toString()
        }
    }];
}
