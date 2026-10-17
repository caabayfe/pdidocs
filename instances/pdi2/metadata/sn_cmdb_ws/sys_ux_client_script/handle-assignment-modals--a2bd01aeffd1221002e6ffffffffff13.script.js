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

    const openModal = helpers.modal.open;

    //Passing isAssigned as true to ensure confirm flow is used
    handleAssignmentModalPayload(event, true, api, openModal);
}
