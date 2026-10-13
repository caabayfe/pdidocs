/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.commTaskToBeUpdated.sysId == api.state.confirmedCommTaskToBeUpdated.sysId && api.state.commTaskToBeUpdated.action == api.state.confirmedCommTaskToBeUpdated.action)
        api.data.update_comm_task_state.refresh();
    else {
        let commTaskToBeUpdated = api.state.commTaskToBeUpdated || {};
        api.setState('confirmedCommTaskToBeUpdated', { ...commTaskToBeUpdated});
    }
}
