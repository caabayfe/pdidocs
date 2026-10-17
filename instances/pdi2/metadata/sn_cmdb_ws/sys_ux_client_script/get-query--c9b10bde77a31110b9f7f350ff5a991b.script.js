/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.multisource_get_query.execute({
        'sys_id' : api.context.props.queryId
    });
}
