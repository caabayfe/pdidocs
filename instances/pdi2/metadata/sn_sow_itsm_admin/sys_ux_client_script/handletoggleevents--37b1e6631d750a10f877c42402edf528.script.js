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
    if (eventName == "toggle-show-hide-overview-tab") {
        blockcontext.overviewTabToggleChecked = eventPayload.value;
        blockcontext.confirmationModalHeader = eventPayload.value ? await helpers.translate("Show overview tab") :
            await helpers.translate("Hide overview tab");
        blockcontext.confirmationModalDescription = eventPayload.value ?
            await helpers.translate("Are you sure you want to show overview tab on the change record page?") :
            await helpers.translate("Are you sure you want to hide overview tab on the change record page?");
            await aceUtils.setContext(blockcontext);
        aceUtils.openModal("23b7-307b-aaaa88-cf71-bb8b8288"); //Confirmation modal
    }
}
