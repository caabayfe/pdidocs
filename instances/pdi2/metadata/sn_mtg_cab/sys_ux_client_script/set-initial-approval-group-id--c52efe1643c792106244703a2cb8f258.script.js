/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (
        event.payload.name === 'approvalsData' &&
        event.payload.value?.groups &&
        event.payload.value?.groups.length > 0
    )
        api.setState('approvalForGroup', event.payload.value?.groups[0]?.sys_id);
}
