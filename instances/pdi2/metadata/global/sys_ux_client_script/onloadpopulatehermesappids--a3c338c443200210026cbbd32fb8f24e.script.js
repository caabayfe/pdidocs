/**
 * After server side fetch of Hermes Application Services table is a success 
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
    let appData;
    try {
        appData = JSON.parse(api.data.hermes_java_backend_scriptable_get_hermes_apps.output.returnValue ?? "[]");
    } catch (ex) {
        appData = [];
    }
    let appIdsJson;
    let appIdSelected;
    let topicFetchArgs = {};
    configureAppData();
    setClientStates();

    /***
    * Fetched app data is then added to the drop down list
    * Selected appId is also a set - 0th element
    */
    function configureAppData() {
        const {
            getAppData
        } = imports["global.HermesUsageMetricsUtil"]();
        let appDataArgs = {
            appData
        };
        appIdsJson = getAppData(appDataArgs);
        appIdSelected = {
            item: appIdsJson[0] ?? {}
        };
    }

    /***
    * Change the encoded query string after appId is populated with default value 
    * to filter and fetch corresponding topics 
    */
    function configureTopicFetchQuery() {
        const {
            getTopicFetchQuery
        } = imports["global.HermesUsageMetricsUtil"]();
        topicFetchArgs = getTopicFetchQuery(api.state.serviceIdSelected.item.id ?? "", appIdSelected.item.id ?? "", api.state.sourceTypeSelected?.item?.id ?? "");
        setClientStates();
    }

    function setClientStates() {
        api.setState("appIds", appIdsJson);
        if (appIdSelected) {
            api.setState("appIdSelected", appIdSelected);
        }
        api.setState("topicFetchArgs", topicFetchArgs);
    }
}
