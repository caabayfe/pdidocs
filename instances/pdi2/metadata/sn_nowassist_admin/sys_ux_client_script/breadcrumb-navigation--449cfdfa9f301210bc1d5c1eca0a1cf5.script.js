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
    var id = event?.payload?.item?.id;
    switch (id) {
        case 'settings':
            api.emit("NAV_ITEM_SELECTED", {
                route: 'plugins'
            });
            break;
        case "now_assist_guardian_pi":
            api.emit("NAV_ITEM_SELECTED", {
                route: 'prompt-injection'
            });
            break;
    }
}
