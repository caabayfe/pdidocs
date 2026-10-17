/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.context.props.articleId){
        api.setState('articleId', api.context.props.articleId);
        api.data.gliderecord_query_1.refresh();
    }
    if(api.context.props.knowledgeBaseId){
        api.setState('knowledgeBaseId', api.context.props.knowledgeBaseId);
        api.setState('selectedRecordType', 'two');
        api.data.gliderecord_query_2.refresh();
    }
}
