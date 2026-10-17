/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { getChildren } = imports["sn_cmdb_ws.DataManagerAssignmentUtil"](...arguments);
    let { 
        assignment: { task_assignment_type: assignmentType }, 
        data_filter: { table: tableName, table_label: tableLabel },
    } = api.state.policyData;
    let { 
        dotWalkAssignmentState: { schema, treeItems, treeExpandedItems }, 
        dotWalkSearchString: searchString
    } = api.state;
    const { name: eventName, payload: { fieldValue } } = event;
    if (eventName == "NOW_INPUT#INPUT") {
        searchString = fieldValue;
        api.setState('dotWalkSearchString', searchString);
    }
    const { output } = api.data.data_manager_get_dotwalk_assignment_options;
    schema = {
        ...schema,
        ...output
    };
    let expandedItems = treeExpandedItems.length > 0 ? treeExpandedItems : [[tableName]];
    let tree = [];
    let children = await getChildren(assignmentType, schema, tableName, [tableName], expandedItems, searchString);

    tree.push({
        id: tableName,
        label: tableLabel,
        children: children
    });

    api.setState('dotWalkAssignmentState', ({currentValue}) => ({
        ...currentValue,
        schema,
        treeItems: tree,
        treeExpandedItems: expandedItems
    }));
}
