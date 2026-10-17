/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.state.hermes.testRunning = false;
    api.state.hermesTopicTimestamp.type = "info";
    api.state.hermes.disableRequestTopicData = false;
    api.setState("hermesStatusMessage", "");
    var data = api.data.hermestopicdata.output;
    api.state.hermes.hideRequestTopicData = true;
    var timestamp = '';
    api.state.hermesTopicTimestamp.hide = false;
    if (data != null && data.timestamp != "") {
        api.state.hermesTopicTimestamp.value = data.timestamp;
    } else {
        api.state.hermesTopicTimestamp.type = "warning";
        api.state.hermesTopicTimestamp.value = "Unable to retrieve message timestamp";
    }
}
