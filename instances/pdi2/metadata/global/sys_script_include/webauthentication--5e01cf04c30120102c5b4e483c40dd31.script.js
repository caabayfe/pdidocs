var WebAuthentication = Class.create();
WebAuthentication.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	logDebug: function(msg) {
        SNC.GlideAuthenticationFactor.logDebugWithScriptSource(msg);
    },
	
    logError: function(msg) {
        SNC.GlideAuthenticationFactor.logErrorWithScriptSource(msg);
    },
	
	initiateRegistration: function () {
		var type = SNC.GlideHTMLSanitizer.sanitize(this.getParameter('sysparm_type'));
		var nickName = SNC.GlideHTMLSanitizer.sanitize(this.getParameter('sysparm_nickname'));
		if(GlideStringUtil.nil(type))
			type = "cross-platform";
		var registrationParam = {};
		registrationParam['type']=type;
		registrationParam['name']=nickName;
		this.logDebug("WebAuthentication registration request initiated for user:"+gs.getUserName()+" , type:"+type+ " , nickname"+nickName);
		return new SNC.GlideAuthenticationFactor("WebAuthnRegistration").initiateRequest(JSON.stringify(registrationParam));
	},
	
	validateRegistrationResponse: function() {
		var responseJson = this.getParameter('sysparm_response');
		this.logDebug("WebAuthentication registration response validation initiated for user:"+gs.getUserName());
		return new SNC.GlideAuthenticationFactor("WebAuthnRegistration").validateResponse(responseJson);
	},
	
	removeAuthenticator: function(sysId) {
		if(sysId)
			var sys_id = sysId;
		else
			var sys_id= this.getParameter('sysparm_sys_id');
		var gr = new GlideRecord('sys_user_public_credential');
		gr.addQuery("user" , gs.getUserID());
		gr.addQuery("sys_id", sys_id);
		gr.query();
		if (gr.next())
			gr.deleteRecord();
		return false;
	},
	
    type: 'WebAuthentication'
});
