/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    debugger;
    var overview = api.state.translations.overview_text;
    var activity = api.state.translations.activity_text;
    return api.state.activity === 'overview' ? overview : activity;
}
