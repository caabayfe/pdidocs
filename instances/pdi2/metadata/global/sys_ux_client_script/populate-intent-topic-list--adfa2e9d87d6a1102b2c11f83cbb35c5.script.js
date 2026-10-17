/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var intentTopicList = {};

    for (const intent of api.data.look_up_intent_topic.results) {
        intentTopicList[intent.ar_intent.value] = intent.matched_topic._reference.active.displayValue;
    }
    
    api.setState('intentTopicList', intentTopicList);
    api.data.active_aggregation.refresh();
}
