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
    //state variables --> aceContents, blockcontext
    var blockcontext = await aceUtils.getContext();
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "list-wrapped-action-clicked") {
        let actionId = eventPayload.wrappedAction;
        if (actionId == "CREATE_NEW_RECORD") {
            helpers.navigate.to("mim-setup-communications-new-plan");
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#COPY_BUTTON_CLICKED") {
            blockcontext.selectedRecords = eventPayload.wrappedPayload.sysIds;
            await aceUtils.setContext(blockcontext);
            await aceUtils.refreshContentBlock("data_block_2");
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#DELETE_BUTTON_CLICKED") {
            blockcontext.selectedRecords = eventPayload.wrappedPayload.sysIds;
            await aceUtils.setContext(blockcontext);
            await aceUtils.refreshContentBlock("data_block_3");
        } else if (eventName == "communication-plan-ref-clicked") {
            helpers.navigate.to("mim-setup-communications-update-plan", {
                planSysId: eventPayload.sys_id
            });
        }
    }
}
