var PwdAjaxChangePassword = Class.create();

PwdAjaxChangePassword.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	
	changePasswordBL : new PWDChangePasswordBL(),
	
	isPublic: function() {
		return false;
	},
	
	getProcessesForUser: function() {
		var userId = this.getParameter('sysparm_user');		
		if(this._hasRole('snc_read_only')) {
			gs.getSession().clearProperty('sysparm_request_id');
			this._setResponseMessage("snc_read_only_role_error", gs.getMessage("One of your roles doesn't have access to the Change Password form. To change the password, contact the service desk. You can still reset the password using the Forgot Password link on the login page."), '');
		}
		
		var processes = this.changePasswordBL.getProcessesForUser(userId);
		if (processes.length == 0)
			gs.getSession().clearProperty('sysparm_request_id');
		processes.forEach(function(process) {
			var processItem = this.newItem('process');
			
			for (var attr in process)
				processItem.setAttribute(attr, process[attr]);
			
		}, this);
	},
	
	_hasRole: function(role) {
		var roles = gs.getSession().getRoles() + '';
		var roleArray = roles.split(",");
		return new ArrayUtil().contains(roleArray, role);
	},
	
	validatePassword: function() {
		var processId = this.getParameter('sysparam_process_id');
		var newPwd = this.getParameter("sysparam_new_password");

		return this.changePasswordBL.validatePassword(processId, newPwd);
	},
	
	// receiver of the change password request from ui.
	// creates a pwd reset request and kicks off the wf
	changePassword: function() {
		var userId = this.getParameter('sysparm_user');
		var procId = this.getParameter('sysparm_procId');		
		var newPasswd = this.getParameter("sysparam_new_password");
		var oldPasswd = this.getParameter("sysparam_old_password");
		
		var result = this.changePasswordBL.changePassword(userId, procId, newPasswd, oldPasswd);
	
		gs.getSession().putProperty('sysparm_request_id', result.requestId);
		gs.getSession().putProperty('sysparm_sys_user_id', userId);
		gs.getSession().putProperty('sysparm_directory', this.type);
		
		if (result.status == this.changePasswordBL.STATUS_BLOCKED) {
			this._setResponseMessage("block", gs.getMessage('User is blocked'), '');					
		}
		else if (result.status == this.changePasswordBL.STATUS_FAILURE) {
			var errorMsg = result.errorMessage;
			this._setResponseMessage("failure", errorMsg, '');
		}
		else {
			this._setResponseMessage("success", gs.getMessage("Password change was successful"), result.ctxId);
		}	
	},
	
	// ui to poll for the wf status
	checkChangePwdWFState: function() {
		var ctxId = this.getParameter('sysparam_wf_context_sys_id');
		var ctx = PWDWorkflowHelper.getWorkflowData(ctxId, false);
		
		this._setResponseMessage(ctx.state, gs.getMessage("Current status of workflow") , ctx.result);
	},
		
	type: 'PwdAjaxChangePassword'
});
