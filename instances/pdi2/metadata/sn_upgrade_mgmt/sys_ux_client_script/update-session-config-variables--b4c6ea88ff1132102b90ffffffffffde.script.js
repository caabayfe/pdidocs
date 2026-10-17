/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let configItems = api.data.look_up_initial_toggle_states.results;

    for (let item of configItems) {
        let key = item["setting_key"]["value"];
        let value = item["setting_value"]["value"];
        
        if (key === "generate_atf_tests") {
            api.setState("generateAtfTestsToggle", value);
        } else if (key === "upgrade_store_apps_to_latest") {
            api.setState("upgradeStoreAppsToLatestToggle", value);
        }
    }
}
