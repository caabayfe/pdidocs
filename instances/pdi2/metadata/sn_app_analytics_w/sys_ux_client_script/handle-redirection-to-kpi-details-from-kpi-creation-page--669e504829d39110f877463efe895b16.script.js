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
    api.emit('NAV_ITEM_SELECTED', {
        route: 'kpi-details',
        title: 'KPI Details',
        fields: {
            dataSourceId: event.payload.kpiSysId,
            dataSource: 'analyticalmodel',
        }
    });
}
