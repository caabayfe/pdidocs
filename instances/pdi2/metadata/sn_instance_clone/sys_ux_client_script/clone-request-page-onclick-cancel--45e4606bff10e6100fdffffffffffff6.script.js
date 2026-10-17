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
    redirect({
        route: 'home',
    });

    function redirect(navPayload) {
        api.emit("NAV_ITEM_SELECTED", {
            ...navPayload,
            reload: true
        });
    }
}
