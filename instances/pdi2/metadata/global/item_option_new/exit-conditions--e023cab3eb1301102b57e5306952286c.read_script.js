answer = JSON.stringify({
    tableName: current.getValue("prediction_table") ? current.getValue("prediction_table") : "sys_cs_auto_resolution_prediction",
    query: current.getValue("exit_condition"),
    displayQuery: current.getDisplayValue("exit_condition"),
    targetTableName: current.getValue("target_table_name")
});
