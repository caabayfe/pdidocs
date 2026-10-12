/**
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
    if (api.data.gliderecord_query_1.output) {
        api.setState('selectedArticle', {
            id: api.state.articleId,
            label: api.data.gliderecord_query_1.output.data.GlideRecord_Query.kb_knowledge._results[0].display_number.value
        })
    }
    if (api.data.gliderecord_query_2.output) {
        api.setState('selectedKnowledgeBase', {
            id: api.state.knowledgeBaseId,
            label: api.data.gliderecord_query_2.output.data.GlideRecord_Query.kb_knowledge_base._results[0].title.value
        })
    }
}
