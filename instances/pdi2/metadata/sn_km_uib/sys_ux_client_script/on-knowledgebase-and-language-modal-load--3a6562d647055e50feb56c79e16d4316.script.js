/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Find the default the knowledge base
    let defaultKb = api.state.defaultSeletedKnowledgeBase;
    const kbList = api.state.writableKnowledgeBaseList;
    if (!defaultKb) {
        defaultKb = kbList && kbList.length ? kbList[0].id : null;
    }
    
    api.setState('defaultSeletedKnowledgeBase', [defaultKb]);
    api.setState('selectedKnowledgeBase', defaultKb);

    // Retrieve languages for the selected knowledge base
    const kbLanguages = api.state.writableKnowledgeBaseData.kbIdToLanguageMap[defaultKb] || [];
    api.setState('kbLanguages', kbLanguages);

    let defaultLanguage = api.state.defaultSelectedLanguage;
    if (!defaultLanguage.length) {
        defaultLanguage = kbLanguages.length > 0 && kbLanguages[0].id ? [kbLanguages[0].id] : [];
    }

    api.setState('defaultSelectedLanguage', defaultLanguage);
    api.setState('selectedLanguage', defaultLanguage.length > 0 ? defaultLanguage[0] : null);

    // if both the language and the knowledge base values exist enable the continue button
    if (kbList.length && kbLanguages.length) {
       api.setState('languagePickerContinueButttonDisabed', false);
    }

}
