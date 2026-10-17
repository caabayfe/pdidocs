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

    if (eventName == "dismiss-modal" || eventName == "ACE_MODAL_CLOSED") {
        var modal = eventPayload.contents ? eventPayload.contents.elementId : eventPayload.contentBlockId;
        switch (modal) {
            // Tier1 and Tier2 modal
            case 'bd53-fe70-8ba9ab-4680-b89a99ab':
            case 'e51a597e93d4021004e40b27648918e4':
                if (blockcontext.variant === "82ed0d8447404210f9bc5222516d4347") //Tier1 Configuration group
                    await aceUtils.refreshContentBlock('data_block_fetch_tier1_properties');
                else if (blockcontext.variant === "37fd4d8447404210f9bc5222516d43c2") //Tier2 Configuration group
                    await aceUtils.refreshContentBlock('data_block_fetch_tier2_properties');
                blockcontext = await aceUtils.getContext();
                blockcontext.variant = "";
                await aceUtils.setContext(blockcontext);
                break;
            // Collapsed list modal
            case 'c6b1-f5dd-99bbbb-fc90-b8b9b889':
            case '4055fae0c35d429084b05085e0013186':
                await aceUtils.refreshContentBlock('data_block_4_fetch_collapse_list_property');
                break;
        }
        aceUtils.dismissModal(modal);

    } else if (eventName == "continue-modal") {
        await aceUtils.refreshContentBlock('data_block_update_property');
        aceUtils.dismissModal("bd53-fe70-8ba9ab-4680-b89a99ab"); //Confirmation Modal

    } else if (eventName == "continue-page-property-modal") {
        await aceUtils.refreshContentBlock('data_block_5_update_collapse_list');
        aceUtils.dismissModal("c6b1-f5dd-99bbbb-fc90-b8b9b889");
    }

}
