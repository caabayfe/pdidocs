/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('EXPLORE_CI_MAIN_CONTENT#UNSAVED_CHANGES_HANDLED');
    
    // switch to the temp edit mode section only if save operation succeeds
    api.setState('editModeSection', api.state.tempEditModeSection);
    
    helpers.timing.setTimeout(() => api.setState('tempEditModeSection', ''));
}
