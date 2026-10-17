(function executeRule(current, previous /*null when async*/) {
	var util = new sn_vsc.SCSecurityPolicyUtil();
	util.updateActivityStream(current,previous);
})(current, previous);
