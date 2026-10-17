async function script({api, event, helpers}) {
    // prevent script firing before data model is ready
    if (!api.state.policyData.assignment)
        return;
    
    let children = [];
    const assignmentType = api.state.policyData.assignment.task_assignment_type;
    let helpText = "";

    if (assignmentType === "user_group_field") {
        helpText = await helpers.translate("Select user group field");
    }
    else if (assignmentType === "specific_user") {
        helpText = await helpers.translate("Search for a specific user (3 characters minimum)");
    }
    else if (assignmentType === "specific_user_group") {
        helpText = await helpers.translate("Search for a group (3 characters minimum)");
    }
    else if (assignmentType === "user_field") {
       helpText = await helpers.translate("Select user field");
    }
    children.push({
        "id": "",
        "label": helpText
    });

    let items = api.data.data_manager_get_assignment_options.output;
    for (let i = 0; i < items.length; i++) {
        children.push(items[i]);
    }
    
    let assignmentOptions = [{
        "id": "assignment_type_typeahead", 
        "label": await helpers.translate("Showing {0} items", api.data.data_manager_get_assignment_options.output.length),
        "children": children
    }];
    api.setState("assignmentOptions", assignmentOptions);
}
