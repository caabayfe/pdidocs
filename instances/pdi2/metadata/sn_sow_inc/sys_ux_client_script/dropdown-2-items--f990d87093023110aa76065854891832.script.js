/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let listValues = [];
    if (api.state.timelineUserPreferences && api.state.timelineUserPreferences.eventGrouping.eventGroupingInMinutes) {
        for (let i = 1; i <= 60; i++) {
            listValues.push({
                "id": i,
                "label": i
            });
        }
    } else {
        for (let i = 1; i <= 24; i++) {
            listValues.push({
                "id": i,
                "label": i
            });
        }
    }

    return listValues;
}
