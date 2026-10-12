/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let queryBuilderUrl = null;
    if (api.context.props.savedQueryId) {
        queryBuilderUrl = "$queryBuilder.do?sysparm_saved_qb_query=" + api.context.props.savedQueryId;
    }
    api.setState("query_builder_url", queryBuilderUrl);
}
