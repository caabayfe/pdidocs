/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var startDate = new Date(api.state.dateJSON.start);
    var endDate = new Date(api.state.dateJSON.end);
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (endDate > yesterday)
        endDate = yesterday;
    var duration = startDate.getDate() + ' ' + startDate.toLocaleString('default', {
        month: 'short'
    }) + ' ' + startDate.getFullYear() + ' - ' + endDate.getDate() + ' ' + endDate.toLocaleString('default', {
        month: 'short'
    }) + ' ' + endDate.getFullYear();
    return duration;
}
