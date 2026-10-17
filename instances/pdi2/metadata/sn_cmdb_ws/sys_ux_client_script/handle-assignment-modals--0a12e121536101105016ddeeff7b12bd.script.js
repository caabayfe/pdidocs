/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { 
        handleAssignmentModalPayload,
        getFormFields 
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    const formFields = getFormFields(api.data.record);
    const {
        assigned_to: {
            value: assignedToValue
        }
    } = formFields;
    const isTaskAssigned = assignedToValue !== null;
    const openModal = helpers.modal.open;

    handleAssignmentModalPayload(event, isTaskAssigned, api, openModal);
}
