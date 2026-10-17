(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('mid_cert_check_policy');

	/* 
	 * sys_id for default records:
	 
	 * Intranet: b23ab21a5b311010eff60e281d81c74b
	 * Internet: 9c3af21a5b311010eff60e281d81c7dd
	 * *.servicenow.com: f30ab21a5b311010eff60e281d81c78c
	 */
	var default_records = ["b23ab21a5b311010eff60e281d81c74b", "9c3af21a5b311010eff60e281d81c7dd", "f30ab21a5b311010eff60e281d81c78c"];
	
	if (default_records.indexOf(String(current.sys_id)) > -1) {
		// deleting default records
		var name =  current.name;
		gs.addErrorMessage(gs.getMessage("Cannot delete default record {0}", [name]));
		current.setAbortAction(true);
	}
})(current, previous);
