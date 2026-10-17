/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let msg = await helpers.translate('Server error');
    const headerMsg = await helpers.translate('Error');
    const errors = event.payload.errors;

    if(errors && errors.length > 0){
        msg = await helpers.translate('Something went wrong. Please contact your administrator.');
    }

    api.setState('listRefreshPayload', {
        timestamp: Date.now()
    });
}
