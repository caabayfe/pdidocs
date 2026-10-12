(function isAllowed() {
	// Protects relationship types that are used by ServiceNow internal systems
	var protectedTypes = gs.getProperty("cmdb.protected.relations");
	if (JSUtil.notNil(protectedTypes)) {
		var typesArr = protectedTypes.split(",");
		return gs.getUser().hasRole("maint") || !current.sys_id || typesArr.indexOf(current.getValue("sys_id")) < 0;
	}
	return gs.getUser().hasRole("sn_cmdb_admin");
})();
