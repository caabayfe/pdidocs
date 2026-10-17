/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var translations = api.state.translations;
    
    helpers.translate('Selecting Last 90 days can increase clone time')
        .then((val) => {
            translations.dataCopyInfoText = val;
            api.setState('translations', translations);
        });

}
