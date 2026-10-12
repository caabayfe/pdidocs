/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;

    if (event.name === "NOW_BREADCRUMBS#ITEM_CLICKED") {
        await aceUtils.refreshContentBlock("get_service_groups");
        await aceUtils.refreshContentBlock("get_all_tabs_data");
        await aceUtils.refreshContentBlock("get_user_data");
    }
}
