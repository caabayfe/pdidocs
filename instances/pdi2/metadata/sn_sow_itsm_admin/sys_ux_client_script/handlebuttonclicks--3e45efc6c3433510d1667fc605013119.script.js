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
    if (eventName == "save-clicked") {
        if (blockcontext.selectedRecipientsList && blockcontext.selectedRecipientsList.length == 0) {
            blockcontext.audienceRequiredAlert = true;
            blockcontext.audienceRequiredAlertObj = [{
                "icon": "circle-exclamation-outline",
                "content": await helpers.translate("Audience is required"),
                "status": "critical"
            }];
            blockcontext.planGForm.validateFormAsync();
            await aceUtils.setContext(blockcontext);
            return;
        }
        blockcontext.triggerSave = "true";
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "create-task-clicked") {
        blockcontext.taskSysId = "-1";
        blockcontext.taskName = "";
        blockcontext.selectedChannelInfo = {
            emailTemplate: null,
            channelInfoMessage: [],
            channels: [],
            selectedChannelType: "none"
        }
        blockcontext.filteredChannels = [];
        blockcontext.showChannelField = false;
        blockcontext.showEmailTemplateField = false;
        blockcontext.showTaskCreateSubtitle = true;
        blockcontext.showTaskUpdateSubtitle = false;
        await aceUtils.setContext(blockcontext);
        aceUtils.openModal("abfb-8d50-bbb9aa-538d-99b98c8b");
    } else if (eventName == "cancel-clicked") {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'now/sow-admin/mim-setup-communications',
                target: '_self'
            }
        });
    }
}
