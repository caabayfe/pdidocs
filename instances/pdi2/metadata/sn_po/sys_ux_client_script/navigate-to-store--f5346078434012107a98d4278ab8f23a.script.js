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
    const storeURL = "https://store.servicenow.com/sn_appstore_store.do#!/store/search?q=process%20mining%20content%20pack";
    var payload = {
        "external": {
            "url": '' + storeURL
        }
    };
    api.emit('NAV_ITEM_SELECTED', payload);
}
