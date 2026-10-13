(function executeRule(current, previous /*null when async*/) {

	// thr rule is "garantee" that sys_update_on is the most updated event 
	// if there was some very long "before" BR was ve
	
	// When we don't want "garantee" that? When is was defined to avoid the update of the field 
	// (like update of "closed" alert or priority calculation etc)
	
	if (previous.sys_updated_on != current.sys_updated_on) {

		// Update the alert update time to "now" at the end of all before BR's
		// so it will not be in the past if before BR's run long time (and can be missed by the impact copy job).
		var currentTime = new GlideDateTime();
		current.sys_updated_on = currentTime;
		
	}

})(current, previous);
