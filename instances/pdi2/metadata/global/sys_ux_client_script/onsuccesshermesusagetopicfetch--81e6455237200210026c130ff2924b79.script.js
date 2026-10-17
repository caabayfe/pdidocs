/**
 * After server side fetch of hermes Usage Metrics (grouped by topic) table is a success 
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
    let topicData = api.data.on_filter_change_hermes_metric_look_up_topic_groups.results;
    let topicUsageTableData;
    let topicUsagePagination = api.state.topicUsagePagination;
    let selectedSourceType = api.state.sourceTypeSelected.item.id;
    configureTopicUsageData();
    setClientStates();

    /***
     * Fetched time series metrics data is transformed into a template 
     * the bar graph component can use
     */
    function configureTopicUsageData() {
        const {
            getTopicUsageTableData,
            getTopicCountForUsageTableData
        } = imports["global.HermesUsageMetricsUtil"]();
        let topicUsageArgs = {
            topicData,
            selectedSourceType
        };
        let totalRecords = getTopicCountForUsageTableData(topicUsageArgs);
        topicUsagePagination.total_records = totalRecords;
        topicUsageTableData = getTopicUsageTableData(topicUsageArgs, topicUsagePagination);
    }

    function setClientStates() {
        api.setState("topicUsageTableData", topicUsageTableData);
        api.setState("topicUsagePagination", topicUsagePagination);
    }
}
