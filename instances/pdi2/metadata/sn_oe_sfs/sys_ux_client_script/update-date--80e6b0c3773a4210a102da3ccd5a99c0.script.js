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
    var duration = {
        'l1': 7,
        'l2': 10,
        'l3': 30
    };
    var selectedDuration = api.state.selectedDuration;
    var days = duration[selectedDuration] || 7;
    var endDate = new Date();
    var startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);
    api.setState('startDate', startDate.toISOString().split('T')[0]);
    api.setState('endDate', endDate.toISOString().split('T')[0]);
}
