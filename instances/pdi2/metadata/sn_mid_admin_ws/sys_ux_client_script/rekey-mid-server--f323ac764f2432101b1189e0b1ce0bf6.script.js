/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.currentAction != 'rekey') {
        api.setState('currentAction', 'rekey');
    } else {
        api.data.mid_server_action_handler.refresh();
    }
}
