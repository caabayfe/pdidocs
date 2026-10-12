/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.hermes.testRunning == false) {
        api.state.hermes.testRunning = true;
        api.setState("hermesStatusMessage", "Please wait. Running Bootstrap Connectivity Test");
        api.state.hermes.disablePortTest = true;
        api.state.hermes.hideBootstrapTestLoading = false;
    }
}
