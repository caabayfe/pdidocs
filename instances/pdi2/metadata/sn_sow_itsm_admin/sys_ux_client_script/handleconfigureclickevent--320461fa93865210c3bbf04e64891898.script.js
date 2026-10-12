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
    var blockcontext = await aceUtils.getContext();
    if (eventName == "incident-properties-configure-clicked") {
        if (blockcontext.isPropertiesConfigured == false) {
            await aceUtils.refreshContentBlock('data_block_update_incident_properties_status');
        }
    }
}
