(function executeRule(current, previous /*null when async*/) {
	var policySysId = current.getUniqueValue();
	gs.info('AIG access policy status changed to published for: ' + policySysId + '. Generating ACLs.');
	try {
		var rbacClient = new sn_auth.GlideRBACClient();
		var response = rbacClient.generateACLsForPolicy(policySysId);
		var responseCode = response.getResponseCode();
		if (responseCode == 200) {
			gs.info('ACL generation succeeded for policy: ' + policySysId);
		} else {
			gs.error('ACL generation failed for policy: ' + policySysId + '. Response: ' + response.getBody());
		}
	} catch (e) {
		gs.error('ACL generation error for policy: ' + policySysId + '. Error: ' + e.message);
	}
})(current, previous);
