/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { 
        data_filter: { table }, 
        assignment: { task_assignment_type: assignmentType } 
    } = api.state.policyData;
    let modalHeading = assignmentType == 'user_field' ?
        await helpers.translate('Select user field') :
        await helpers.translate('Select user group field');
    let modalDescription = assignmentType == 'user_field' ?
        await helpers.translate('Select the user field to use to determine task assignment. Only fields referencing the User table are selectable.') :
        await helpers.translate('Select the user group field to use to determine task assignment. Only fields referencing the Group table are selectable.');
    api.setState('dotWalkAssignmentState', ({ currentValue }) => ({
        ...currentValue,
        modalHeading,
        modalDescription,
        treeExpandedItems: [[table]],
        ts: Date.now()
    }));
    api.setState('dotWalkSearchTable', table);
    helpers.modal.open('dot_walk_assignment_modal', { bare: true });
}
