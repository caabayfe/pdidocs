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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    if (api.state.sourceInstanceId == "currentInstance") {
        const cleanupScriptTableName = !api.state.cloneProfile ? 'clone_cleanup_script' : 'clone_profile_cleanup_scripts';
        const cleanupScriptRowName = !api.state.cloneProfile ? 'name' : 'cleanup_script';
        eventHandler.openDefinitionsModal(cleanupScriptTableName, api.state.text.Cleanup_Scripts, cleanupScriptRowName);
    } else {
        // Open Multi instance Table
        eventHandler.openExternalPage(api.state.cleanupScriptsTableLink);
    }
}
