/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        handleLinkClick
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const {
        value
    } = event.context.item;

    handleLinkClick(helpers, value.link);
}
