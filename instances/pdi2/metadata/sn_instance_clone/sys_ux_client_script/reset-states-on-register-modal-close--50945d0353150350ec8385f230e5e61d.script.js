/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    function loaderComponent(show) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: show,
            label: "Loading...",
            action: null,
            nonBlocking: false
        });
    }
    loaderComponent(false);
    api.setState('hideClientIdContainer',true);
    api.setState('hideOAuthErrorSetup',true);
    api.setState('newTargetUrl','');
    api.setState('disableNewTargetButton',true);
    api.setState('targetClientID','');
    api.setState('disableCompleteSetupBtn',true);
    helpers.modal.close('register_instance');
}
