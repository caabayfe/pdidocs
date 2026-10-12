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
        assignedTo: {
            value: assignedToValue
        }
    } = api.data.certCtrl.taskData;
    const isTaskAssigned = assignedToValue !== null;
    const openModal = helpers.modal.open;

    handleAssignmentModalPayload(event, isTaskAssigned, api, openModal);
}
