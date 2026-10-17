/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.setState("topics", api.data.get_topics_list.output.data.now.taxonomy.getTopicHierarchy);
}
