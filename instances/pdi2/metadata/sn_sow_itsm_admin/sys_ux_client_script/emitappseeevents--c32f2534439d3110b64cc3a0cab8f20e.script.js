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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName.includes("Landing_Page_")) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Landing Page Customize Clicked",
            value: {
                "eventName": eventName.replace('Landing_Page_', ''),
                "scope_id": "sn_sow_itsm_admin",
                "sys_id": event.payload.eventPayload.contentBlockId
            }
        });
    };
}
