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
            // Overview tab visibility confirmation  modal
            case '138edaef1d350a10f877c42402edf572':
            case '23b7-307b-aaaa88-cf71-bb8b8288':
                await aceUtils.refreshContentBlock('get_overview_tab_state');
                break;
        }
        aceUtils.dismissModal(modal);

    } else if (eventName == "continue-modal") {
        await aceUtils.refreshContentBlock("set_overview_tab_state");
        aceUtils.dismissModal("23b7-307b-aaaa88-cf71-bb8b8288"); //Confirmation modal
    }
}
