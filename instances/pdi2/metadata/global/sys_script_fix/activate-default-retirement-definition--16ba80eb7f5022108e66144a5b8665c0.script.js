if(!pm.isZboot()) {
    gs.info("Fix Script: Started CMDB Update field attribute 'active' to 'true' for table: cmdb_ci");

    var cmdbRetirementDefGr = new GlideRecord("cmdb_retirement_custom_definitions");
    cmdbRetirementDefGr.addQuery("table", "cmdb_ci");
    cmdbRetirementDefGr.query();
    if (cmdbRetirementDefGr.next()) {
        cmdbRetirementDefGr.active = true;
        cmdbRetirementDefGr.update();
    }
	
	if (!cmdbRetirementDefGr.getLastErrorMessage()) { 
		gs.info("Fix Script: Finished CMDB Update field attribute 'active' to 'true' for table: cmdb_ci");
	} else {
		gs.info("Fix Script: Failed CMDB Update field attribute 'active' to 'true' for table: cmdb_ci");
	    	gs.info(cmdbRetirementDefGr.getLastErrorMessage());
	}
	
	
}
