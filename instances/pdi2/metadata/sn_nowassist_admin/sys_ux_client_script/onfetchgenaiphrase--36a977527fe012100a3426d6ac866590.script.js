/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
   
    var generatedPhrase = event?.payload?.data?.output;
    for (let i = 0; i < generatedPhrase.length; i++) {
        generatedPhrase[i].isSelected = false;
        generatedPhrase[i].isAdded = false;
        generatedPhrase[i].isEdit = false;
        generatedPhrase[i].isNew = true;
    }
    api.setState('generatedPhrase',generatedPhrase);
    api.setState('isLoading', false);
    
}
