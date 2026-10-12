function transform(input) {
    var jsonResponse = {};
    var tableName = input.tableName;
    if (tableName != null) {
        jsonResponse.tableDisplayValue = GlideTableDescriptor.get(tableName).getLabel();
		jsonResponse.tableName = tableName;
    }

    var tableSysId;
	var gr = new GlideRecord("sys_dictionary");
    gr.addEncodedQuery("internal_type=collection");
    gr.addQuery("name", input.tableName);
    gr.query();
    while (gr.next()) {
        tableSysId = gr.getValue("sys_id");
        break;
    }

	const auditConsoleURL = `now/audit_management_console/table/${tableName}/${tableSysId}`;
	jsonResponse.auditConsoleURL = auditConsoleURL;

    return jsonResponse;
}
