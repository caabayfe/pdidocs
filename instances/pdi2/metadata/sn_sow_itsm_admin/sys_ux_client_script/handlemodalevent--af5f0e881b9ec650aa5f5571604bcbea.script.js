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
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "continue-overview-tab-visibility-modal") {
        await aceUtils.refreshContentBlock('data_block_update_overview_tab_visibility');
        aceUtils.dismissModal('9293-8629-999a9a-1591-89ba34b8');

    } else if (eventName == "enable-user-criteria-checkbox-checked-set") {
        var blockcontext = await aceUtils.getContext();
        blockcontext.userCriteriaPropChecked = eventPayload.value;
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "dismiss-overview-tab-visibility-modal" || eventName == "ACE_MODAL_CLOSED") {
        var modal = eventPayload.contents ? eventPayload.contents.elementId : eventPayload.contentBlockId;
        switch (modal) {
            // Overview tab visibility confirmation  modal
            case 'f552d68c1b9ec650aa5f5571604bcbad':
            case '9293-8629-999a9a-1591-89ba34b8':
                await aceUtils.refreshContentBlock('data_block_fetch_overview_tab_visibility');
                break;
        }
        aceUtils.dismissModal(modal);
    }
}
