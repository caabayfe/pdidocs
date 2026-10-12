(function(finding) {

	var tableString = 'scheduled_import_set,sysauto_script';
	var tables = tableString.split(",");
	//loop through tables and check if Run As users has the recommended Default User
	for (var i = 0; i < tables.length; i++) {
		var tableName = tables[i];
		var scriptgr = new GlideRecord(tableName);
		scriptgr.addEncodedQuery("sys_scope.nameSTARTSWITHVulnerability^ORsys_scope.nameSTARTSWITHQualys Vulnerability Integration^active=true");
		scriptgr.query();
		while (scriptgr.next()) {
			if (scriptgr.run_as.user_name != 'VR.System' && scriptgr.run_as.sys_id != 'c98e5bb253333200e8f9f745911c087a') {
				finding.setCurrentSource(scriptgr);
				finding.increment();
			}
		}

	}

})(finding);
