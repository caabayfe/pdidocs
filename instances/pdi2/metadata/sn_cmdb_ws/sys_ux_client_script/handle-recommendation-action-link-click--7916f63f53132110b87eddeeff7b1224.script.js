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
        actionLink
    } = event.context.item.value;

    // If there is a ts, update it on click of the link
    if (actionLink.route && actionLink.route.fields && actionLink.route.fields.ts)
        actionLink.route.fields.ts = Date.now();

    handleLinkClick(helpers, actionLink);
}
