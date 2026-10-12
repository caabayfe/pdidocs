/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.open('status_modal');
    api.setState('statusBoqId', '');
    api.setState('statusBoqId', api.state.boqId);
    api.setState('isStatusNotFetched', true);
    api.setState('isLoaderVisible', false);
}
