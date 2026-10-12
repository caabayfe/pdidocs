/**
 * On change of values in the service id dropdown triggers an event 
 * which in turn calls this client script
 * 
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let elementIdToClientStateMap = {
        "service_id_typeahead": "serviceIdSelected"
    }
    let topicFetchArgs= {};
    configureTopicFetchQuery();

    /***
     *  Method has 2 functions
     *  a). Change the serviceIdSelected client state - to store new value
     *  b). Change the encoded query string after serviceId selection 
     *      to filter and fetch corresponding topics 
     */
    function configureTopicFetchQuery() {
        const {
            getTopicFetchQuery
        } = imports["global.HermesUsageMetricsUtil"]();
        topicFetchArgs = getTopicFetchQuery(event.payload.value ?? "", api.state.appIdSelected.item.id ?? "", api.state.sourceTypeSelected.item.id ?? "");
        setClientStates();
    }

    /***
     *  Sets global state values
     *  State values can also trigger actions to those compoenents they bind to
     */
    function setClientStates() {
        api.setState(elementIdToClientStateMap[event.elementId], event.payload);
        api.setState("topicFetchArgs", topicFetchArgs);
    }
}
