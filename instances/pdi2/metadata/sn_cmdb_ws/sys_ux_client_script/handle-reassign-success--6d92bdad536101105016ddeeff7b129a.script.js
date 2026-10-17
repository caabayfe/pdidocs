/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (api.state &&
        api.state.reassignmentStatus &&
        api.state.reassignmentStatus.status &&
        api.state.reassignmentStatus.status === 'success') {
        const { 
            handleReassignToMeSuccess,
            handleReassignToOtherSuccess,
            handleSendToAdminSuccess
        } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

        const {
            type: reassignmentType
         } = api.state.reassignmentStatus;

        const emit = api.emit;
        const translate = helpers.translate;
        const openModal = helpers.modal.open;
        const policyTypeId = api?.data?.task_detail_record?.result?.policy_id?._reference?.cmdb_policy_type?.value;
         
        if (reassignmentType === 'assign_to_me') {
            await handleReassignToMeSuccess(emit, translate, helpers, policyTypeId);
        } else if (reassignmentType === 'assign_to_other') {
            await handleReassignToOtherSuccess('viewport_jjm', emit, translate, openModal);
        } else if (reassignmentType === 'send_to_admin') {
            await handleSendToAdminSuccess('viewport_jjm', emit, translate, openModal);
        }

        api.setState('reassignmentStatus', null);
    }
}
