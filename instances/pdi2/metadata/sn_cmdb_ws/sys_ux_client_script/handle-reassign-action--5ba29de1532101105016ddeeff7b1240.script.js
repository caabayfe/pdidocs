/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { 
        handleAssignToMe,
        handleAssignToOther, 
        handleSendToAdmin,
        getFormFields
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    const { hasDataManagerAdminOrAdminOrMaint } = imports["sn_cmdb_ws.userRoleUtils"]();
    const { name } = event;
    let id;
    if (name == 'NOW_SPLIT_BUTTON#ACTION_CLICKED' || name == 'NOW_BUTTON#CLICKED') {
        id = api.state.reassignmentOptions.primaryId;
    } else if (name == 'NOW_SPLIT_BUTTON#ITEM_CLICKED') {
        id = event.payload.item.id;
    }
    if (!id)
        return;

    const {
        assigned_to: {
            value: assignedToValue
        },
        assignment_group: {
            value: assignmentGroupValue
        }
    } = getFormFields(api.data.record);
    const openModal = helpers.modal.open;

    const isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
    api.setState('reassignmentStatus', {
        type: id
    });
    
    if (id === 'assign_to_me') {
        handleAssignToMe(assignedToValue, api, openModal);
    } else if (id === 'assign_to_other') {
        handleAssignToOther('viewport_ndj', isAdmin, assignmentGroupValue, api.emit, openModal);
    } else if (id === 'send_to_admin') {
        handleSendToAdmin('viewport_kly', api.emit, openModal);
    }
}
