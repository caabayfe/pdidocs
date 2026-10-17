/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        route: 'ac_kpi_details',
        title: 'KPI Details',
        fields: {
            uuid: event.payload.indicatorSysid,
        },
        params: {
            breakdowns: event.payload.breakdowns,
            aggregate: event.payload.aggregate,
            scoreDate: event.payload.scoreDate,
            domain: event.payload.domain,
        }
    });
}
