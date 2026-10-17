/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var topicsList = api.data.hermestopics.output;
    var isInternal = api.state.hermesIsInternal;
    if(isInternal == false){
        api.setState("externalTopics",topicsList);
    }
    else {
        api.setState("internalTopics", topicsList);
    }
}
