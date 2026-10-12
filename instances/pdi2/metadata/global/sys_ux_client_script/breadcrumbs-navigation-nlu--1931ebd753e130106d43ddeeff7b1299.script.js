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
        item
    } = event.payload;

    let fields = {};
    let params = {
        't': Date.now()
    };
    helpers.navigate.to(item.id, fields, params);
}
