/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let updatedConfig = [{
        sessionId: api.state.upgradeSessionId,
        key: 'generate_atf_tests',
        value: api.state.generateAtfTestsToggle
    }, {
        sessionId: api.state.upgradeSessionId,
        key: 'upgrade_store_apps_to_latest',
        value: api.state.upgradeStoreAppsToLatestToggle
    }];
    api.setState("configSessionValues", updatedConfig);
}
