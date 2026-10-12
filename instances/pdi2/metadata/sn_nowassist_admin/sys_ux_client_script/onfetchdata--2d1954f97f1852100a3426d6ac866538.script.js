/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
api.setState('filterDetails', api.data?.get_filter_topic_details_1?.output?.filterDetails);
api.setState('cbTopicId', api.data?.get_filter_topic_details_1?.output?.cbTopicId);
api.setState('isConversationalStudioInstalled', api.data?.get_filter_topic_details_1?.output?.isConversationalStudioInstalled);
}
