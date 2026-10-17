/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    const { 
        handleAssignToMe,
        handleAssignToOther, 
        handleSendToAdmin
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    const { 
        name,
        payload: {
            sysIds
        }
    } = event;
    const isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
    if (name == 'DM_TASK#REASSIGN') {
        handleAssignToOther('viewport_1', isAdmin, '', api.emit, helpers.modal.open);
    } else if (name == 'DM_TASK#ASSIGN_TO_ME') {
        handleAssignToMe('', api, helpers.modal.open);
    } else if (name == 'DM_TASK#REQ_REASSIGN') {
        handleSendToAdmin('viewport_2', api.emit, helpers.modal.open);
    }
    
    api.setState('selectedSysIds', sysIds);
}
