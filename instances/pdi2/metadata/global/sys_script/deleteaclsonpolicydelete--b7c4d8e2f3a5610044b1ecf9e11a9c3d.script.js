(function executeRule(current, previous /*null when async*/) {
	var policySysId = current.getUniqueValue();
	gs.info('AIG access policy being deleted: ' + policySysId + '. Deleting associated ACLs.');
	try {
		var rbacClient = new sn_auth.GlideRBACClient();
		var response = rbacClient.deleteACLsForPolicy(policySysId);
		var responseCode = response.getResponseCode();
		if (responseCode == 200) {
			gs.info('ACL deletion succeeded for policy: ' + policySysId);
		} else {
			gs.error('ACL deletion failed for policy: ' + policySysId + '. Response: ' + response.getBody());
			current.setAbortAction(true);
		}
	} catch (e) {
		gs.error('ACL deletion error for policy: ' + policySysId + '. Error: ' + e.message);
		current.setAbortAction(true);
	}
})(current, previous);
