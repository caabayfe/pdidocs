/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    const {
        getReassignOptions
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    const {
        assignedTo: {
            value: assignedToValue
        },
        assignmentGroup: {
            value: assignmentGroupValue
        }
    } = event.payload.taskData;

    const isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
    const isCurrentAssignee = assignedToValue === api.context.session.user.sys_id;
    const options = await getReassignOptions(helpers.translate, isCurrentAssignee, isAdmin, assignmentGroupValue);
    
    api.setState('reassignmentOptions', options);
}
