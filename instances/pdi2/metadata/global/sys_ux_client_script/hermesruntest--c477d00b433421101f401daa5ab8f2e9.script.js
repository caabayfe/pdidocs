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
        api.setState("hermesStatusMessage", "Please wait. Running Instance Connectivity Test");
        api.state.hermes.hideClusterTestLoading = false;
        api.state.hermes.disableRunTest = true;
        api.state.hermesHideTest.outbound = true;
        api.state.hermesHideTest.inbound = true;
    }
}
