/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedLanguage = event.payload.value[0];
    if(selectedLanguage && selectedLanguage != ''){
        api.setState('selectedLanguage', selectedLanguage);
        api.setState('languagePickerContinueButttonDisabed', false);
    }
    
}
