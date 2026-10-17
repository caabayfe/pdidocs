/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { navigateToView } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const { leftNavItems, labelsTooltips } = api.state;
    const { id } = event.payload.item;
    const indexById = leftNavItems.findIndex((x) => x.id == id);
    if (indexById == 0) {
        labelsTooltips.continueBtnTooltip =  "";
        api.setState("labelsTooltips", labelsTooltips);
    }
    navigateToView(leftNavItems, indexById);
}
