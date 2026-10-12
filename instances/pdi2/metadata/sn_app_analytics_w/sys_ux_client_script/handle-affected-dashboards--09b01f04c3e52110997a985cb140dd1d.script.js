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
    const payload = {
        fields: {
            table: 'par_dashboard',
        },
        params: {
            query: event.payload.query,
            listTitle: 'Dashboards'
        },
        route: 'simplelist',
        title: 'Dashboards',
    };
    api.emit('NAV_ITEM_SELECTED', payload);
}
