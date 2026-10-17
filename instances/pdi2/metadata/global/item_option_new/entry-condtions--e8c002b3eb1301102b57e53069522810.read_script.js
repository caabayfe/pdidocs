answer = JSON.stringify({
    tableName: current.getValue("target_table_name"),
    query: current.getValue("condition"),
    displayQuery: current.getDisplayValue("condition"),
    targetTableName: current.getValue("target_table_name")
});
