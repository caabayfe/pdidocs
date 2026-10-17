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
    const activityField = event.payload.row.rowData.value.get('field').columnData.value;
    const filteredActivityRecommendations = api.state.filteredActivityRecommendations.map(item => {
        return { ...item,
            selected: false
        };
    });

    api.setState('filteredActivityRecommendations', filteredActivityRecommendations);
    // Selected activity ID is reset to trigger a network incase user clicks on the same activity twice
    api.setState('selectedActivityID', '');
    api.setState('selectedActivityID', event.payload.sys_id);
    api.setState('currentTableDisplayName', '');
    api.setState('currentTableDisplayName', 'Activity Definition');
}
