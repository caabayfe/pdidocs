var VaCustomAdapterPropertyUtil = Class.create();
VaCustomAdapterPropertyUtil.prototype = {
	VERIFICATION_QUE_PROPERTY_NAME : "verification_question_id",
	MFA_PROPERTY_NAME : "mfa_question_id",
	
    initialize : function() {
		var source = "VaCustomAdapterPropertyUtil";
        var logContext = {
			"app": "CI",
			"track": "CCCIF",
			"source": source
        };
        this.logger = new sn_log.GlideLogger(source, logContext, ["app", "track", "source"]);
    },

	/*
	  returns the list of verification_question_id and mfa_question_id property applicable to all the providerApp record in the system
	*/
	getPwdVerificationIds : function() {
		var QNA = 'QnA';
		var MFA = 'QnA_and_mfa';

		var cafScriptObject = new sn_cs.CustomAdapterScriptObject();

		var result = [];
		var providerAppGr = new GlideRecord('sys_cs_provider_application');
		providerAppGr.query();
		while(providerAppGr.next()) {
			var providerAppId = providerAppGr.getUniqueValue(); 

			var providerLinkType = providerAppGr.provider.account_link_type.toString();
			var providerAppLinkType = cafScriptObject.getAccountLinkType(providerAppId);

			if(providerAppLinkType == QNA || providerLinkType == QNA) {
				result.push(this._getVerificationQueId(providerAppId));
			} 
			
			if(providerAppLinkType == MFA || providerLinkType == MFA) {
				result.push(this._getVerificationQueId(providerAppId));
				result.push(this._getMFAId(providerAppId));
			}
		}
		
		// removing empty/null ids, can happen incase the properties are not present on provider app 
		result = result.filter(function(verificationId) { return !gs.nil(verificationId); });

		var arrayUtil = new ArrayUtil();  
		return arrayUtil.unique(result);  
	},

	_getAccountLinkTypeForApp: function(providerAppId) {
		var cafScriptObject = new sn_cs.CustomAdapterScriptObject();
		return cafScriptObject.getAccountLinkType(providerAppId);
	},

	_getVerificationQueId : function(providerAppId) {
		return this._getCustomAdapterProperty(this.VERIFICATION_QUE_PROPERTY_NAME, providerAppId);
	},
	
	_getMFAId : function(providerAppId) {
		return this._getCustomAdapterProperty(this.MFA_PROPERTY_NAME, providerAppId);
	},
	
	_getCustomAdapterProperty : function (name, providerAppId) {
		try {
			return sn_cs.VASystemObject.getCustomAdapterPropertyWithHierarchy(name, providerAppId);
		} catch (e) {
			var message = e.message;
			this.logger.error("Exception while getting : CustomAdapterProperty {0} for providerAppId {1} \n {2}", name, providerAppId, message);
		}
		return "";	
	},
	
	_getProviderAppIds : function() {
		var providerAppIds = [];
		var providerAppGr = new GlideRecord("sys_cs_provider_application");
		providerAppGr.query();
		while(providerAppGr.next()) {
			providerAppIds.push(providerAppGr.getUniqueValue());
		}
		return providerAppIds;
	},
	
    type: 'VaCustomAdapterPropertyUtil'
};
