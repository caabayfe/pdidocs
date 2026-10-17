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
    const selectedRecords = event.payload && event.payload.selectedRecords;
    if (selectedRecords.length) {
        selectedRecords.forEach(sysId => {
            api.emit('NAV_ITEM_SELECTED', {
                route: 'analytics-source-edit',
                title: 'Analytics Source Edit',
                fields: {
                    sysId
                }
            });
        });
    }
}
