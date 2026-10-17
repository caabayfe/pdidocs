/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedKnowledgeBase = event.payload.value[0];
    if(selectedKnowledgeBase == api.state.selectedKnowledgeBase){
        return;
    }
    api.setState('selectedKnowledgeBase', selectedKnowledgeBase);    
    api.setState('kbLanguages', []);
    api.setState('languagePickerContinueButttonDisabed', true);
    
}
