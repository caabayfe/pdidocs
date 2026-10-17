/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('hideAlert', false);
    api.setState('alertType', 'positive');
    api.setState('alertIcon', 'circle-check-outline');
    helpers.translate('Simulation schedule updated.').then((translatedText) => {
      api.setState('alertMessage', translatedText);
    });
}
