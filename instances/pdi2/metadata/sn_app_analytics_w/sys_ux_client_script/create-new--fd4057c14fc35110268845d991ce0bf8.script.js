/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        route: 'analytics-source-creation',
        title: 'Analytics Source Creation',
        fields: {
            // sysId is undefined when user clicks "New" button on viz library
            sysId: 'new' + Date.now()
        }
    });
}
