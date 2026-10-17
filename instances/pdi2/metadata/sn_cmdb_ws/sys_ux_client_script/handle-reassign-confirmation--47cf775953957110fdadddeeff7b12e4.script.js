/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        selectedSysIds,
        reassignmentData
    } = api.state;

    api.data.update_task_assignment.execute({
        sysIds: selectedSysIds.split(','),
        ...reassignmentData
    });
}
