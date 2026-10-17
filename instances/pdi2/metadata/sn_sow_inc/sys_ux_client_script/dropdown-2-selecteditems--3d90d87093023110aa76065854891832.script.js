/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.timelineUserPreferences && api.state.timelineUserPreferences.eventGrouping) {
        if (api.state.timelineUserPreferences.eventGrouping.eventGroupingInMinutes) {
            return [api.state.timelineUserPreferences.eventGrouping.eventGroupingInMinutes];
        } else {
            return [api.state.timelineUserPreferences.eventGrouping.eventGroupingInHours];
        }
    }
}
