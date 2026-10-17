/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    api.setState('isLoading', true);
    if(api.state.isRealTimeLoad){
        helpers.translate('Refresh in progress...').then((value) => {
            api.setState('statusText', api.state.statusText + ' | ' + value);
        });
    }
    api.data.run_important_actions.refresh();
}
