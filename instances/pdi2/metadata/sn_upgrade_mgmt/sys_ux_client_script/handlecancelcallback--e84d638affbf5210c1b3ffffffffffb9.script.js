/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('showTg', !api.state.showTg);
    api.setState('hideTg', !api.state.hideTg);
    api.setState('isTgInProgress', true);
    api.setState('isTgCompleted', true);
    api.setState('isMarkCompleteDisabled', false);
    api.setState('isSkipDisabled', false);
    api.setState('isCancelDisabled', false);
    api.setState('isStatusDisabled', false);
    api.setState('isRefreshDisabled', false);
    api.setState('showLoading', true);
}
