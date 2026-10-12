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
        const preserverTableName = !api.state.cloneProfile ? 'clone_data_preserver' : 'clone_profile_preservers';
        const preserverRowName = !api.state.cloneProfile ? 'name' : 'preserver';
        eventHandler.openDefinitionsModal(preserverTableName, api.state.text.Preservers, preserverRowName);
    } else {
        // Open Multi instance Table
        eventHandler.openExternalPage(api.state.preserversTableLink);
    }
}
