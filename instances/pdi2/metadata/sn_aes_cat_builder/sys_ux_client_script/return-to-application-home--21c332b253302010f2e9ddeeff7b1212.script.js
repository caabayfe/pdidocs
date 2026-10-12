/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.emit('SN_AES_BUILDER#CLOSE_CURRENT_TAB', {"nextSelectedTabId": "home"});
}
