/**
 * On change of values in the app id dropdown triggers an event 
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
        "app_id_typeahead": "appIdSelected"
    }
    let topicFetchArgs= {};
    configureTopicFetchQuery();

    /***
    *  Method has 2 functions
    *  a). Change the appIdSelected client state - to store new value
    *  b). Change the encoded query string after appId selection 
    *      to filter and fetch corresponding topics 
    */
    function configureTopicFetchQuery() {
        const {
            getTopicFetchQuery
        } = imports["global.HermesUsageMetricsUtil"]();
        topicFetchArgs = getTopicFetchQuery(api.state.serviceIdSelected.item.id ?? "", event.payload.value ?? "", api.state.sourceTypeSelected.item.id ?? "");
        setClientStates();
    }

    function setClientStates() {
        api.setState(elementIdToClientStateMap[event.elementId], event.payload);
        api.setState("topicFetchArgs", topicFetchArgs);
    }
}
