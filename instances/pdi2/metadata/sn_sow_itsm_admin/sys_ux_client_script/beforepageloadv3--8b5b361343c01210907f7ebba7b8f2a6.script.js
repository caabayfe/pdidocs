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
    //Use this client scrip for beforePage load actions. Use aceUtils Methods, blockContext and contentTree.
    const {
        eventName,
        eventPayload
    } = event.payload;
    let blockContext = eventPayload.blockContext;
    blockContext.statusLabelValueMap = {
        "not-previewed": await helpers.translate("Not previewed"),
        "previewed": await helpers.translate("Previewed"),
        "complete": await helpers.translate("Complete")
    }
    blockContext.statusColorValueMap = {
        "not-previewed": "critical",
        "previewed": "purple",
        "complete": "positive"
    }
    blockContext.differentScopeAlertMessage = await helpers.translate("In order to perform this migration, you must switch to the following application scope: Service Operations Workspace ITSM Common.");
    blockContext.previewMigrationAlertMessage = await helpers.translate("Preview the following views to see how the SOW landing page will look with configurable charts. Once you’re previewed both views, you will be able to migrate. This will migrate the charts for both the Tier 1 and Tier 2 landing pages. Any changes made to the dashboard via scripts will be copied to the configurable charts when you click Preview migration.");
    blockContext.chartsMigrationAlertMessage = await helpers.translate("The charts have been migrated on the SOW landing page for Tier 1 Agents & Tier 2 Agents.");
    blockContext.generalErrorMessage = await helpers.translate("Something went wrong. Please check logs for more details.");
    await aceUtils.setContext(blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
}
