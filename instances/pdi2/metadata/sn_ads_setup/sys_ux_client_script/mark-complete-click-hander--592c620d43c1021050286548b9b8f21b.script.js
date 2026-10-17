/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('PLAYBOOK#COMPLETE_ACTIVITY_CONTEXT', {
        'contextId': api.state.contextId
    });
}
