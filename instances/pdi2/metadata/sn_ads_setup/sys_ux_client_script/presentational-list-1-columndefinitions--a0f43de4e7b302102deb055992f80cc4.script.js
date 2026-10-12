function evaluateProperty({
    api,
    helpers
}) {
    var columnDefs = api?.data?.list_controller?.columnDefinitions
    if (!columnDefs) return [];
    
    var columns = columnDefs.columns;
    if (!columns) return [];
    
    var len = columns.length;
    if (len >= 3) 
        columns.splice(-3);

    // Add dynamically action column
    var actionColumnSchemaObj = {
        key: 'action',
        label: helpers.translateSync('Action'),
        type: 'link'
    };
    columns.push(actionColumnSchemaObj);
    columns[0].label = helpers.translateSync('Application');
    return columnDefs;
}
