/**
 * After server side fetch of Kafka Topics table is a success 
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
    // Load fetched data
    let topicData;
    try {
        topicData = JSON.parse(api.data.hermes_java_backend_scriptable_get_topics.output.returnValue ?? "[]");
    } catch (ex) {
        topicData = [];
    }
    let topicsJson;
    let topicSelected;
    configureTopicData();
    setClientStates();

    /***
     * Fetched topic data is then added to the drop down list
     * Selected topic is also a set to default - 0th element
     */
    function configureTopicData() {
        const {
            getTopicData
        } = imports["global.HermesUsageMetricsUtil"]();
        let topicDataArgs = {
            topicData
        };
        topicsJson = getTopicData(topicDataArgs);
        topicSelected = {
            item: topicsJson[0] ?? {
                id: ""
            }
        };
    }

    function setClientStates() {
        api.setState("topics", topicsJson);
        api.setState("topicSelected", topicSelected);
    }
}
