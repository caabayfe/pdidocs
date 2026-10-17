/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        timeSeries: {
            bins,
            unit,
        }
    } = api.data.fetch_project_metric_time_series_1.output.data.GlidePromin_Query;

    const frequencyMap = {
        "DAY": "daily",
        "WEEK": "weekly",
        "MONTH": "monthly",
        "HALF_YEAR": "half_yearly"
    };

    // generate timeseries data
    api.setState('timeSeriesData', [{
        "data": bins.map(item => ({
            "value": item.value.toString(),
            "timestamp": item.time.toString(),
            "frequency": item.frequency,
        })),
        "metadata": {
            "aggregate": {
                "fieldType": "glide_duration"
            },
            "format": {
                "frequency": frequencyMap[unit || 'DAY'],
                "unitFormat": "SHORT",
                "maxDurationUnit": "DAY",
                "minDurationUnit": "HOUR",
                "hideSeconds": true,
                "showOriginalValueInTooltip": false,
                "rounding": "DOWN",
                "customFormat": true
            },
            "dataSourceLabel": await helpers.translate("Average time to completion"),
            "series": [{
                "id": "value",
                "label": await helpers.translate("Average time to completion for all records in the project"),
                "type": "value"
            }]
        },
    }]);
}
