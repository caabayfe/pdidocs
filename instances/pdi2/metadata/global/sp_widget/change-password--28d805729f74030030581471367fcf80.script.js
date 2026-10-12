(function(data) {
	var user_id = gs.getUser().getID();
	data.procId = gs.getProperty('glide.service_portal.default_password_process', 'c6b0c20667100200a5a0f3b457415ad5');
	data.password_hint = getPasswordHint(data.procId);
	
	if (input && input.action === 'update') {
		var password_reset_util= new global.PasswordResetUtil();
		var encypted_new_passwd = password_reset_util.encryptWithKMFModule(input.new_password);
		var encypted_old_passwd = password_reset_util.encryptWithKMFModule(input.old_password);
		var process = new SNC.PwdProcess(data.procId);
		var processSysId = process.getId();
		var trackingMgr = new SNC.PwdTrackingManager();
		var isUserLocked = trackingMgr.isRequestLocked(user_id, processSysId);
		if(isUserLocked) {
			data.result = gs.getMessage("Failed to change Password: You have either exceeded the attempt limit or recently changed your password. Please try again later.");
		} else {
			var requestId = trackingMgr.createRequest(processSysId, user_id, gs.getSessionID(), 3);// 3: request type for Change Password
			trackingMgr.updateRequestActionType(requestId, 4);// 4: request action type for Change Password

			var pwdFlowHelper = new PwdFlowHelper();
			var outputs = pwdFlowHelper.startMasterSubFlow(requestId, encypted_new_passwd, encypted_old_passwd, '2'); // 2: change password action.
			if (outputs.is_flow == false) {
				if (!gs.nil(outputs.context_id)) {
					var ctxId = outputs.context_id.sys_id;
					var wf_gr = new GlideRecord('wf_context');
					if (wf_gr.get(ctxId)) {
						data.result = wf_gr.getValue('result');
						data.state = wf_gr.getValue('state');
					}
				} else {
					data.result = gs.getMessage("Failed to change password.");
				}
			} else {
				if (outputs.status == "Success") {
					data.result = "success";
					trackingMgr.updateRequestStatusAndRetry(requestId, 1);// 1: Success
				} else {
					if (!gs.nil(outputs.error_message) && outputs.error_message != 'Flow stopped executing') {
						data.result = outputs.error_message;
					} else {
						data.result = gs.getMessage("Failed to change password.");
					}
					trackingMgr.updateRequestStatusAndRetry(requestId, -1); // -1: Failure
				}
			}
		}
	}

	data.newPasswordMsg = gs.getMessage("New Password");
	data.currentPasswordMsg = gs.getMessage("Current Password");
	data.confirmPasswordMsg = gs.getMessage("Confirm Password");
	data.complexityMsg = gs.getMessage("Invalid password: " + data.password_hint);
	data.successMsg = gs.getMessage('Your password has been changed successfully!');
	data.wrongPasswordMsg = gs.getMessage('The old password you provided does not match our records.');
	data.reusedPasswordMsg = gs.getMessage('New password cannot be same as your current password.');
	data.notMatchMsg = gs.getMessage('Passwords must match.');

	function getPasswordHint(procId) {
		var credMgr = new SNC.PwdCredentialStoreManager();
		var credId = credMgr.getCredentialStoreIdByProcessId(procId);
		var credGr = new GlideRecord('pwd_cred_store');
		if (credGr.get(credId)) { 
			return credGr.pwd_rule_hint;
		}
	}
	
})(data);
