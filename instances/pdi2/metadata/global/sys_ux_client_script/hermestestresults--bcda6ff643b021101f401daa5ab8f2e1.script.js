/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.state.hermes.testRunning = false;
    api.state.hermes.hideClusterTestLoading = true;
    var hermesStatus = api.data.hermesteststatus.output;

    switch (hermesStatus.health) {
        case "GREY":
        case "RED":
            helpers.translate("Hermes cluster configuration is incomplete or invalid. Please contact Support.").then((val) => api.setState('hermesStatusMessage',val));
            //update icon
            api.state.hermesHideIcons.RED = false;
            api.state.hermesHideIcons.GREEN = true;
            api.state.hermesHideIcons.GREY = true;
            api.state.hermesHideIcons.YELLOW = true;
            api.state.hermes.isValid = false;
        break;
        case "GREEN":
            api.setState("hermesStatusMessage", "");            
        break;
        default:
        break;
    }
    
    //display status messages
    api.state.hermesHideTest.outbound = false;
    api.state.hermesHideTest.inbound = false;
    api.state.hermes.disableRunTest = false;

    var children = hermesStatus.children;
    var w1 = children.TEST_MESSAGE_SEND.warnings;
    var warnings_outbound = w1.join(' | ');
    var w2 = children.TEST_MESSAGE_RECEIVE.warnings;
    var warnings_inbound = w2.join(' | ');

    api.state.hermesTestResults.outbound = warnings_outbound;
    api.state.hermesTestResults.inbound = warnings_inbound;

    //display icons
    switch (children.TEST_MESSAGE_SEND.health) {
        case "GREEN":
            api.state.hermesTestResultType.outbound = 'positive';
        break;
        case "RED":
            api.state.hermesTestResultType.outbound = 'warning';
        break;

    }
    switch (children.TEST_MESSAGE_RECEIVE.health) {
        case "GREEN":
            api.state.hermesTestResultType.inbound = 'positive';
        break;
        case "RED":
            api.state.hermesTestResultType.inbound = 'warning';
        break;

    }
}
