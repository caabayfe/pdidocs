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
    if (eventName == "SOW_ADMIN_CENTER_GFORM_SAVED") {
        if (api.context.props.triggerRuleSysId == "-1") {
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: `now/sow-admin/mi-trigger-rule/${eventPayload.sysId}/params/alert/new`,
                    target: '_self'
                }
            });
        } else {
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: `now/sow-admin/mi-trigger-rule/${eventPayload.sysId}/params/alert/edit`,
                    target: '_self'
                }
            });
        }
    } else if (eventName == "SOW_ADMIN_CENTER_GFORM_SAVE_ATTEMPTED") {
        blockcontext.triggerSave = "false";
        await aceUtils.setContext(blockcontext);
    }
}
