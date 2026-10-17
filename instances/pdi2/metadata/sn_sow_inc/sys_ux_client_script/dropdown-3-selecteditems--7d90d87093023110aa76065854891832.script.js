/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.timelineUserPreferences) {
        if (api.state.timelineUserPreferences.eventGrouping.eventGroupingInMinutes) {
            return ['mins'];
        } else {
            return ['hours'];
        }
    }
}
