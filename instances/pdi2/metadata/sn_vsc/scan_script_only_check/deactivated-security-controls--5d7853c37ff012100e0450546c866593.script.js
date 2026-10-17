(function (finding) {
	var tableNames = ["sys_security_acl", "sys_security_data_filter"];
	var securityControl = "[SNOW_API_REDACTED_SECURITY_CONTROL]";
	for (var i = 0; i < tableNames.length; i++) {
		var tableName = tableNames[i];
		var gr = new GlideRecord(tableName);
		if (!gr.isValid()) {
			continue;
		}
		gr.addQuery("active", false);
		gr.addQuery("description", "CONTAINS", securityControl);
		gr.query();
		while (gr.next()) {
			var updateGr = new GlideRecord("sys_update_xml");
			updateGr.addQuery("name", tableName + "_" + gr.sys_id);
			updateGr.setLimit(1);
			updateGr.query();
			if (!updateGr.next()) {
				continue;
			}
			if (updateGr.payload.includes("<active>false</active>") && 
					updateGr.payload.includes(securityControl) && 
					updateGr.payload.includes(gr.sys_id) && 
					updateGr.action == "INSERT_OR_UPDATE") {
				finding.setCurrentSource(gr);
				finding.increment();
			}
		}
	}
})(finding);
