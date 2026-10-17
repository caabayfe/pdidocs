/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        handleAssignmentModalPayload 
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    const {
        assigned_to: {
            value: assignedToValue
        }
    } = api.data.get_task_info.result;
    const isTaskAssigned = assignedToValue !== null;
    const openModal = helpers.modal.open;

    handleAssignmentModalPayload(event, isTaskAssigned, api, openModal);
}
