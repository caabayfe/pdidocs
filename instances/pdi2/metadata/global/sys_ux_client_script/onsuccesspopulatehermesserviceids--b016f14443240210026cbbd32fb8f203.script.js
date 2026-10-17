/**
 * After server side fetch of Services table is a success 
 * this client script is executed
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
    let serviceIdData;
    try {
        serviceIdData = JSON.parse(api.data.hermes_java_backend_scriptable_get_hermes_services.output.returnValue ?? "[]");
    } catch (ex) {
        serviceIdData = [];
    }
    let serviceIdsJson;
    let serviceIdSelected;
    let topicFetchArgs = {};
    configureServiceIdData();
    setClientStates();
    configureTopicFetchQuery();

    /***
    * Fetched service data is then added to the drop down list
    * Selected serviceId is also a set - 0th element
    */
    function configureServiceIdData() {
        const {
            getServiceIdData
        } = imports["global.HermesUsageMetricsUtil"]();
        let serviceIdDataArgs = {
            serviceIdData
        };
        serviceIdsJson = getServiceIdData(serviceIdDataArgs);
        serviceIdSelected = {item:serviceIdsJson[0] ?? {}};
    }

    /***
    * Change the encoded query string after serviceId is populted with default value 
    * to filter and fetch corresponding topics 
    */
    function configureTopicFetchQuery() {
        const {
            getTopicFetchQuery
        } = imports["global.HermesUsageMetricsUtil"]();
        topicFetchArgs = getTopicFetchQuery(serviceIdSelected.item.id ?? "",api.state.appIdSelected.item.id ?? "", api.state.sourceTypeSelected?.item?.id ?? "");
        setClientStates();   
    }

    function setClientStates() {
        api.setState("serviceIds", serviceIdsJson);
        if (serviceIdSelected) {
            api.setState("serviceIdSelected", serviceIdSelected);
        }
        api.setState("topicFetchArgs", topicFetchArgs);
    }
}
