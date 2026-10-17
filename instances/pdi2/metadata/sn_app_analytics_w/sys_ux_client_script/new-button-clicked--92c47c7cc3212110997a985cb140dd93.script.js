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
    const {
        table
    } = event.payload;
    switch (table) {
        case 'par_component_filter':
            api.emit('NAV_ITEM_SELECTED', {
                route: 'filter-designer',
                title: 'New Filter',
                fields: {
                    sysId: 'new' + Date.now()
                },
            });
            return;
            break;
    }
}
