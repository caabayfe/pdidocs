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
        getReassignOptions,
        getFormFields
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    const formFields = getFormFields(api.data.record);
    if (formFields) {
        const {
            assigned_to: {
                value: assignedToValue
            },
            assignment_group: {
                value: assignmentGroupValue
            }
        } = formFields;

        const isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
        const isCurrentAssignee = assignedToValue === api.context.session.user.sys_id;
        const options = await getReassignOptions(helpers.translate, isCurrentAssignee, isAdmin, assignmentGroupValue);

        api.setState('reassignmentOptions', options);
    }
}
