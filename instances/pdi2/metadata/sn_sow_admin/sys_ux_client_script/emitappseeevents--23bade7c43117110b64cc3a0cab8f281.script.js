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
    if (eventName.includes("Agent_Redirect_")) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            event: "Agent Redirection Page Clicked",
            value: {
                "eventName": eventName.replace("Agent_Redirect_", ""),
                "scope_id": "sn_sow_admin",
                "sys_id": event.payload.eventPayload.contentBlockId
            }
        });
    };
}
