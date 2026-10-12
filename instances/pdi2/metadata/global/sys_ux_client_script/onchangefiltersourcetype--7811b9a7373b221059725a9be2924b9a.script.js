/**
 * On change of values in the source type dropdown triggers an event 
 * which in turn calls this client script
 * 
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    let elementIdToClientStateMap = {
        "source_id_typehead": "sourceTypeSelected"
    };
    let topicFetchArgs = {};
    configureTopicFetchQuery();

    /***
    *  Method has 2 functions
    *  a). Change the sourceTypeSelected client state - to store new value
    *  b). Change the encoded query string after sourceType selection 
    *      to filter and fetch corresponding topics 
    */
    function configureTopicFetchQuery() {
        const { 
            getTopicFetchQuery 
        } = imports["global.HermesUsageMetricsUtil"]();
        topicFetchArgs = getTopicFetchQuery(api.state.serviceIdSelected.item.id ?? "", api.state.appIdSelected.item.id ?? "", event.payload.value ?? "");
        setClientStates();
    }

    function setClientStates() {
        api.setState(elementIdToClientStateMap[event.elementId], event.payload);
        api.setState("topicFetchArgs", topicFetchArgs);
    }
}
