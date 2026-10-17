/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        route: 'simplelist',
        title: event.payload.listTitle,
        fields: {
            table: event.payload.table
        },
        params: {
            listTitle: event.payload.listTitle,
            query: event.payload.query
        }
    });
}
