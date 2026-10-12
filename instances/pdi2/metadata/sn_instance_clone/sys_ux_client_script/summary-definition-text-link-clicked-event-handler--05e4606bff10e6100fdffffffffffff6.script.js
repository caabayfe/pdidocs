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
        if (!api.state.cloneProfile) {
            switch (event.payload.item.table) {
                case "clone_profile_exclusions":
                    event.payload.item.table = "clone_data_exclude";
                    break;
                case "clone_profile_preservers":
                    event.payload.item.table = "clone_data_preserver";
                    break;
                case "clone_profile_cleanup_scripts":
                    event.payload.item.table = "clone_cleanup_script";
                    break;
            }
            event.payload.item.rowName = "name";
        }
        eventHandler.openDefinitionsModal(event.payload.item.table, event.payload.item.tableLable, event.payload.item.rowName);
    } else {
        // Open Multi Instance Table
        switch (event.payload.item.table) {
            case "clone_profile_exclusions":
                eventHandler.openExternalPage(api.state.exclusionsTableLink);
                break;
            case "clone_profile_preservers":
                eventHandler.openExternalPage(api.state.preserversTableLink);
                break;
            case "clone_profile_cleanup_scripts":
                eventHandler.openExternalPage(api.state.cleanupScriptsTableLink);
                break;
        }
    }
}
