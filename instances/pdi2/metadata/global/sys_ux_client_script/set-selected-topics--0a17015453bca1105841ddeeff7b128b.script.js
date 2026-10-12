/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('currentTopics', event.payload);
    // for topic change emitting the relay event for two reasons
    // first the state update is async hence cant use state variable in the handler
    // second, the list selector component sends the changes in event.payload, hence
    // cant use @payload directly in the param for eveent handler.
    api.emit('_EX_TOPIC_SELECTOR_PAGE#TOPIC_CHANGE_REQUESTED_RELAY_203dc6085374a1105841ddeeff7b12cc', {
        "selectedTopics" : event.payload
    });
}
