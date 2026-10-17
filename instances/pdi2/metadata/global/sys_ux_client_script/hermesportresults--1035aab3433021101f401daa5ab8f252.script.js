/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.state.hermesPortTestResults.hideAlert = false;
    api.state.hermes.hideBootstrapTestLoading = true;
    api.state.hermes.testRunning = false;
    api.state.hermesPortTestResults.producer = api.data.hermestestports.output.children.PRODUCER_PORTS.warnings;
    api.state.hermesPortTestResults.consumer = api.data.hermestestports.output.children.CONSUMER_PORTS.warnings;

    var portsLevel = "low";
    switch (api.data.hermestestports.output.health) {
        case "RED":
        case "YELLOW":
            portsLevel = "high";
        break;
        case "GREEN":
            portsLevel = "positive";
        break;
        default:
            portsLevel = "low";
        break;
    }
    api.state.hermesPortTestResults.warning.level = portsLevel;
    api.state.hermesPortTestResults.warning.message = api.data.hermestestports.output.warnings[0];
    api.setState("hermesStatusMessage", "");

    if (api.data.hermestestports.output.health == "RED") {
        //no need to re-run test if there is an error.
        //user can reload the page once they have confirmation the ports are available.
        api.state.hermes.disablePortTest = true;
        api.state.hermes.isValid = false;
    } else {
        api.state.hermes.disablePortTest = false;
    }
}
