/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var defaultKnowledgeBase = api.state.defaultSeletedKnowledgeBase;
    if(defaultKnowledgeBase){
        api.setState('defaultSeletedKnowledgeBase', [defaultKnowledgeBase]);
        api.setState('selectedKnowledgeBase', defaultKnowledgeBase);
        var kbLanguages = api.state.writableKnowledgeBaseData.kbIdToLanguageMap[defaultKnowledgeBase];
        api.setState('kbLanguages', kbLanguages);
    }
    else{
        api.setState('defaultSeletedKnowledgeBase', []);
    }

}
