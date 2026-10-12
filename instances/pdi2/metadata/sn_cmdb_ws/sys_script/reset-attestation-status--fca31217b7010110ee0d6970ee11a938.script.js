(function executeRule(current, previous /*null when async*/) {
	var util = new CMDBAttestationUtil();
	var ciSysId = current.ci;
	util.resetAttestationStatus(ciSysId);
})(current, previous);
