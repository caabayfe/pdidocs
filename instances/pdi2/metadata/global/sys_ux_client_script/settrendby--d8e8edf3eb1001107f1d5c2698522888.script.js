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

    const trendBy = {
        "trendByFrequency": "date",
        "trendByFields": [{
            "field": "anything",
            "metric": "YldWMGNtbGpRbUZ6WlcxaVgyUmxiVzlmWkhKdmJtVXhOak15T0RJME56RXhNamt4MTYzMjgyNDcxMjY2NQ=="
        }]
    };

    api.setState("trend_by", trendBy);

}
