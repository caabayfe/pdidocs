/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    //Update trend by in utilization chart based on the timeline selected in Timeline dropdown
    const selectedTimeline = event.payload.value[0];
    let trendByFrequency = 'month';

    switch (selectedTimeline) {
        case 'monthly':
            trendByFrequency = 'month';
            api.setState('utilizationChartXAxisLabel', 'Month');
            break;
        case 'daily':
            trendByFrequency = 'date';
            api.setState('utilizationChartXAxisLabel', 'Date');
            break;
    }
    const utilizationTrend = {
        "trendByFields": [{
            "field": "accrual_time",
            "metric": "ZEdGaWJHVnpkRjlzYVdObGJuTmxYMlJsZEdGcGJGOXRaWFJ5YVdNeE5qWTVNVFl3TmpNeE16TTQxNjY5MTYwNjMyMzc3"
        }],
        "trendByFrequency": trendByFrequency,
        "trendByMinuteInterval": null
    };
    api.setState('utilizationChartTrendBy', utilizationTrend);
    api.setState('listRefresh', {
        timestamp: new Date().getTime(),
        background: true
    });


    return utilizationTrend;
}
