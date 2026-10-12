/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     if (api.state.hermes.disableRequestTopicData == false && api.state.hermes.testRunning == false) {
        api.state.hermes.testRunning = true;
        api.state.hermes.hideRequestTopicData = false;
        api.state.hermes.disableRequestTopicData = true;
        api.state.hermesTopicTimestamp.value = "";
        api.state.hermesTopicTimestamp.hide = true;
        api.setState("hermesStatusMessage", "Please wait. Retrieving Topic Information for " + event.context.item.value.topic);

        //sets current topic name and topic type based on the topic that was selected
        if (api.state.hermesTopicName != event.context.item.value.topic || api.state.hermesIsInternal != true) {
            api.setState("hermesTopicName", event.context.item.value.topic);
            api.setState("hermesIsInternal", true);
        }

        if(api.state.hermesServiceScriptableParamForTopicInfo != api.state.selectedServiceForTopic.id ||
            api.state.hermesIsInternalScriptableParam != true) {
            api.setState("hermesServiceScriptableParamForTopicInfo", api.state.selectedServiceForTopic.id);
            api.setState("hermesIsInternalScriptableParam", true);
        } else {
            api.data.hermestopicdata.refresh();
        }
    }
}
