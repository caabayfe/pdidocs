/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const selectedRecords = api.state.selectedKPIsForEdit;
    selectedRecords.forEach(record => {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'pa-new-model-kpi',
            title: 'Edit - KPI',
            icon: 'kpi-outline',
            fields: {
                sysId: record
            }
        });
    });
}
