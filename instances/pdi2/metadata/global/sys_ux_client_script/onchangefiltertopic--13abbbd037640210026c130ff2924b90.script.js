/**
* On change of values in the topic dropdown triggers an event 
* which in turn calls this client script
*
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    setClientStates();

    /***
     *  Sets global state values
     *  state values can also trigger actions to those compoenents they bind to
     */
    function setClientStates() {
        api.setState("topicSelected", event.payload);
    }
}
