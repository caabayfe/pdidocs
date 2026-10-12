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
    api.emit("NAV_ITEM_SELECTED", {
        route: 'features',
        fields: {
            workflow: '0f3e04d7a320311079f66bcf26fcdacc',
        },
        params: {
            t: Date.now()
        }
    });
}
