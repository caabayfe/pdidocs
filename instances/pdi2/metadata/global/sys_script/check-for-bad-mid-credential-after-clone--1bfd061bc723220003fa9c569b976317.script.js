(function executeRule(current, previous /*null when async*/) {
	
	//
	// Business Rule:
	// 1) On entry the status of the MID Server is attempting to transition from 'Down' to 'Up.
	// 2) If a record exists in the ecc_issue_agent table for the current
	//    MID Server logged by the InstanceClone with a state other than
	//    Resolved, update the state to Resolved and the last_detected
	//    field to the current time.
	//
	var ECC_AGENT_SOURCE_FIELD_VALUE = "InstanceClone";
	var ECC_AGENT_ISSUE_TABLE = "ecc_agent_issue";
	var LAST_DETECTED = "last_detected";
	var MID_SERVER = "mid_server";
	var NOT_EQUAL = "!=";
	var SOURCE_FIELD = "source";
	var STATE_FIELD = "state";
	var STATE_FIELD_VALUE_RESOLVED = "Resolved";
	var SYSID_FIELD = "sys_id";
	
	// Search for existing ecc_agent_issue table record for MID Server logged by InstanceClone
	var eccAgentIssueGlideRecord = new GlideRecord(ECC_AGENT_ISSUE_TABLE);
	eccAgentIssueGlideRecord.addQuery(MID_SERVER, current.getValue(SYSID_FIELD));
	eccAgentIssueGlideRecord.addQuery(SOURCE_FIELD, ECC_AGENT_SOURCE_FIELD_VALUE);
	eccAgentIssueGlideRecord.addQuery(STATE_FIELD, NOT_EQUAL, STATE_FIELD_VALUE_RESOLVED);
	eccAgentIssueGlideRecord.query();
	
	// update existing record status to Resolved?
	if (eccAgentIssueGlideRecord.next()) {
		
		// Notate the problem has been resolved
		eccAgentIssueGlideRecord.setValue(LAST_DETECTED, new GlideDateTime());
		eccAgentIssueGlideRecord.setValue(STATE_FIELD, STATE_FIELD_VALUE_RESOLVED);
		
		if (eccAgentIssueGlideRecord.update() == null)
			gs.error("Table update failed: " + ECC_AGENT_ISSUE_TABLE);
		
	}
	
})(current, previous);
