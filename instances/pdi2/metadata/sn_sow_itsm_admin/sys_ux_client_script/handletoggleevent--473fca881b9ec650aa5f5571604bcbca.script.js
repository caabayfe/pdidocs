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
    if (eventName == "toggle-change-incident-overview-tab-visibility") {
        var isToggleDisabled = eventPayload.value;
        var modelDesc = isToggleDisabled ?
            await helpers.translate("The Overview tab will be displayed on the incident record for all agents.") :
            await helpers.translate("The Overview tab will no longer be displayed on the incident record for tier 1 agents.");
        var modelTitle = isToggleDisabled ? await helpers.translate("Show the Overview tab") :
            await helpers.translate("Hide the Overview tab for tier 1 agents?");
        blockcontext.confirmationModalDescription = modelDesc;
        blockcontext.confirmationModalTitle = modelTitle;
        blockcontext.hideOverviewTab = String(isToggleDisabled);
        blockcontext.userCriteriaMsg = "<p>" + await helpers.translate("Enable the system property and check the box to hide the overview tab for tier 1 agents {0}", "<now-text-link label='glide.ux.user_criteria_enabled' href=" + blockcontext.userCriteriaPropLink + " opens-window/>") + "</p>";
        await aceUtils.setContext(blockcontext);
        aceUtils.openModal('9293-8629-999a9a-1591-89ba34b8');
    }
}
