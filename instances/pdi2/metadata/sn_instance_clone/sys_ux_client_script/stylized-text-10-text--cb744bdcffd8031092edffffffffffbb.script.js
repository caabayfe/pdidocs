/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var overview = api.state.translations.instance_overview;
    var activity = api.state.translations.clone_activity;
    return api.state.activity === 'overview' ? overview : activity;
}
