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
    if (eventName == "SOW_ADMIN_CENTER_GFORM_DATA_FETCH_SUCCESS") {
        blockcontext.planGForm = eventPayload.gform;
        blockcontext.isPlanFormLoading = false;
        blockcontext.showPlanFormCustomFields = true;
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "SOW_ADMIN_CENTER_GFORM_SAVED") {
        let recordSysId = eventPayload.sysId;
        blockcontext.recordSysId = recordSysId;
        await aceUtils.setContext(blockcontext);
        await aceUtils.refreshContentBlock("data_block_2");
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: `now/sow-admin/mim-setup-communications-update-plan/${recordSysId}/params/alert/new`,
                target: '_self'
            }
        });
    } else if (eventName == "SOW_ADMIN_CENTER_GFORM_SAVE_ATTEMPTED") {
        blockcontext.triggerSave = "false";
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "recipient-selected") {
        blockcontext.selectedRecipients = eventPayload.value;
        blockcontext.audienceRequiredAlert = false;
        blockcontext.audienceRequiredAlertObj = [];
        await aceUtils.setContext(blockcontext);
    }
}
