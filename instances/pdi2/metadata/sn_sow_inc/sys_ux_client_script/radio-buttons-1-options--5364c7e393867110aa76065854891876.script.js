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
        let ascendingLabel = helpers.translateSync('Ascending ');
        let orderAscendingLabel = helpers.translateSync('First to last');

        let descendingLabel = helpers.translateSync('Descending ');
        let orderDescendingLabel = helpers.translateSync('Last to first');

        return [{
                "id": "asc",
                "checked": api.state.timelineUserPreferences.orderOfEvents == "asc",
                "label": ascendingLabel+'('+orderAscendingLabel+')'
            },
            {
                "id": "desc",
                "checked": api.state.timelineUserPreferences.orderOfEvents == "desc",
                "label": descendingLabel+'('+orderDescendingLabel+')'
            }
        ];
    }
}
