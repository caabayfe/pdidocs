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
        const timestamp = new Date().getTime();
        api.emit("NAV_ITEM_SELECTED", {
            route: 'home',
            params: {
                customId: timestamp
            }
        });
}
