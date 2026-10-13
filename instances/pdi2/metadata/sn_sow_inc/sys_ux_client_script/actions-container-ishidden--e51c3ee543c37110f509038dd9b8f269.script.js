/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    if (api.state.isTimelineSettingsEditModeOn)
        return false;
    else
        return true;
}
