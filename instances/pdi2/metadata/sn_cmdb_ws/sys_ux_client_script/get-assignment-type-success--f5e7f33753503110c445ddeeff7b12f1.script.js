/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const results = api.data.get_assignment_type.output.assignmentTypes;
    if (!results || results.length === 0)
        return; // this is an error
    
    const assignmentTypeListItems = [];
    assignmentTypeListItems.push({
        "label" : await helpers.translate("Select a user or a user group field, or a specific user or user group, to assign tasks"),
        "id": ""
    });
    results.forEach((assignmentTypeData) => {
        assignmentTypeListItems.push({
            "label" : assignmentTypeData.label,
            "id": assignmentTypeData.value
        });
    });
    api.setState("assignmentTypeListItems", assignmentTypeListItems);
    api.setState("supportsDotWalkAssignment", api.data.get_assignment_type.output.supportsDotWalkAssignment);
}
