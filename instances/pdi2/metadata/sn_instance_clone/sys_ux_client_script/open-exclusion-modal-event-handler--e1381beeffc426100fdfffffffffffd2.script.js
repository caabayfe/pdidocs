/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    if (api.state.sourceInstanceId == "currentInstance") {
        const exlusionTableName = !api.state.cloneProfile ? 'clone_data_exclude' : 'clone_profile_exclusions';
        const exlusionRowName = !api.state.cloneProfile ? 'name' : 'exclusion';
        eventHandler.openDefinitionsModal(exlusionTableName, api.state.text.Exclusions, exlusionRowName);
    } else {
        // Open Multi instance Table
        eventHandler.openExternalPage(api.state.exclusionsTableLink);
    }
}
