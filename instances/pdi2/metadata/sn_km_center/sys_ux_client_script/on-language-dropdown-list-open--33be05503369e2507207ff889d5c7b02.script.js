/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedKnowledgeBase = api.state.selectedKnowledgeBase;
    var kbLanguages = api.state.writableKnowledgeBaseData.kbIdToLanguageMap[selectedKnowledgeBase];
    api.setState('kbLanguages', kbLanguages);
}
