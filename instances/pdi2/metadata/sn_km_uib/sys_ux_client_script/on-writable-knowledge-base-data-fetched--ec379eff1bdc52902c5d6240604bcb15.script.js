/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var writableKnowledgeBaseData = api.data.fetch_writable_knowledge_base.output;
    var writableKnowledgeList = writableKnowledgeBaseData.kbList;
    api.setState('writableKnowledgeBaseData', writableKnowledgeBaseData);
    api.setState('writableKnowledgeBaseList', writableKnowledgeList);
    api.setState('canShowLanguagePicker', writableKnowledgeBaseData['canShowLanguagePicker']);
    api.setState('sourceTable' , writableKnowledgeBaseData['sourceTable']);
    api.setState('targetTable' , writableKnowledgeBaseData['targetTable']);
}
