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
    const payload = event.payload;
    const page = payload.item && payload.item.page;
    if (page) {
        api.emit('NAV_ITEM_SELECTED', {
            route: page,
            reload:true
        });
    }


}
