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
    const eventErrors = event.payload.errors;
    if (eventErrors && eventErrors.length > 0) {
        const status = eventErrors[0];
        if (status.detail) {
            if (status.detail === "50123")
                api.setState('kpiScoreSummary', "");
                
        }
    }
    const apiResponse = api.data.pa_new_model_kpi_score_summary_1.output;
    if (!apiResponse) {
        api.setState('error', 'unknown_error');
        return;
    } else if (apiResponse.error && apiResponse.error.message.indexOf('Not Found')) {
        api.setState('error', 'invalid_kpi');
        return;
    }

    const kpiScoreSummary = apiResponse.result[0];
    if (!kpiScoreSummary ||
        !kpiScoreSummary.response ||
        !kpiScoreSummary.response.data ||
        kpiScoreSummary.response.data.length == 0) {
        api.setState('error', "no_score");
        return;
    }
}
