/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { getChildren } = imports["sn_cmdb_ws.DataManagerAssignmentUtil"](...arguments);
    const { value } = event.payload;
    let { 
        dotWalkAssignmentState: { schema, treeItems, treeExpandedItems }, 
        dotWalkSearchString: searchString, 
    } = api.state;
    let latestItem = value[value.length - 1];
    let table = latestItem[0];
    for (let i = 1; i < latestItem.length; i++) {
        let field = latestItem[i];
        table = schema[table][field].reference;
    }
    let expandedItems = [...value];
    if (!schema.hasOwnProperty(table))
        api.setState('dotWalkSearchTable', table);
    let { assignment: { task_assignment_type: assignmentType }, data_filter: { table: tableName, table_label: tableLabel } } = api.state.policyData;
    const { output } = api.data.data_manager_get_dotwalk_assignment_options;
    schema = {
        ...schema,
        ...output
    };

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
