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
    try {
        if (event.name != 'NOW_BREADCRUMBS#ITEM_CLICKED') return;
        const {
            route,
            fields,
            params
        } = event.payload.item;
        helpers.navigate.to(route, 
            { ...fields},
            { ...params}
        );
    } catch (e) {
        return;
    }
}
