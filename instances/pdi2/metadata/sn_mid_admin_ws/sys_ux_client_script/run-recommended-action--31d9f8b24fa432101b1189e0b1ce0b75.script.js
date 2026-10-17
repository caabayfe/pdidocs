/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    console.info(event);
    var rec_action = event.context?.item?.value.action;
    if (api.state.currentAction != rec_action) {
        api.setState ('currentAction', rec_action);
    } else {
        api.data.mid_server_action_handler.refresh();
    }
}
