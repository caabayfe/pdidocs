(function isAllowed() {
	var protectedTypes = gs.getProperty("cmdb.protected.relations", "");
	var typesArr = protectedTypes.split(",");
	if (JSUtil.notNil(protectedTypes) && current.sys_id && typesArr.indexOf(current.getValue("sys_id")) > -1) {
		return gs.getUser().hasRole("maint");
	}      
	return gs.getUser().hasRole("sn_cmdb_admin");
})();
