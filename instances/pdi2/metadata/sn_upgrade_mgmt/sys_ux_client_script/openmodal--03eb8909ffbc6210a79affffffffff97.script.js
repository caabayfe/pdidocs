/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.state.sessionType === 'bulk_app_update'){
        api.setState('hideAppUpdate', false);
        api.setState('hideAppUpgrade', true);
    } else {
        api.setState('hideAppUpdate', true);
        api.setState('hideAppUpgrade', false);
    }
    helpers.modal.open("upgrade_confirmation_modal");
}
