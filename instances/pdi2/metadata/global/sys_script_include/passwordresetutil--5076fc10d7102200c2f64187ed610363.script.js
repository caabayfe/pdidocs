var PasswordResetUtil = Class.create();
PasswordResetUtil.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {

	isPublic: function() {
		return true;
	},
	
	verifyBL: new PwdVerifyStageBL(),

	validatePassword: function() {
		var validateErr = SNC.PasswordResetUtil.validateStrongerPassword();
		if ("true" != validateErr)
			this.setAnswer("false");
		else
			this.setAnswer("true");
	},

	sendResetEmail: function() {
		if (!this._validateSecurity()) {
			return;
		}
		//Restrict reset email in case of same csrf token
		var isCsrfTokenRepeated = false;
		var csrfToken = '';
		csrfToken = gs.getSession().getProperty("pwd_reset_csrf_token");
		if (csrfToken == null || (csrfToken + '' != this.getCsrfToken() + '')) {
			gs.getSession().putProperty("pwd_reset_csrf_token", this.getCsrfToken());

		} else {
			if (csrfToken + '' == this.getCsrfToken() + '') {
				isCsrfTokenRepeated = true;
			}
		}

		var RESET_URL_TOKEN_VALIDATION_PENDING = 5;
		var pwdTrackingManager = new SNC.PwdTrackingManager();
		var result = this.newItem("result");
		var userId = gs.getSession().getProperty('sysparm_sys_user_id');
		// We get the requestId from the trustworthy session so no need to sanitize
		var requestId = gs.getSession().getProperty('sysparm_request_id');
		var processId = pwdTrackingManager.getProcessIdByRequestId(requestId);
		var redirectUrl = gs.getSession().getProperty('pwd_redirect_url');
		gs.getSession().putProperty('pwd_reset_done_redirect', gs.getSession().getProperty('pwd_redirect_url'));
		var isRequestInValid = pwdTrackingManager.isRequestInvalid(requestId);
		var isRequestStatusURLTokenPending = pwdTrackingManager.getRequestStatus(requestId) === RESET_URL_TOKEN_VALIDATION_PENDING;
		var resetUrlEmailLimitReached = this._isEmailLimitReached(processId, userId);

		if (isRequestInValid || !isRequestStatusURLTokenPending || isCsrfTokenRepeated || resetUrlEmailLimitReached) {
			result.setAttribute("result", "true");
			if (resetUrlEmailLimitReached)
				this.verifyBL.logWarning("The maximum number of reset URL emails that can be sent within 24 hours has reached its limit", requestId);
		} else {
			this._sendResetEmail(userId, requestId, result, redirectUrl);
		}
	},

	_sendResetEmail: function(userId, requestId, result, redirectUrl) {
		var user = this.validateUser(userId);
		if (user == undefined) {
			result.setAttribute("result", "false");
			return;
		}

		result.setAttribute("result", this.raiseSendEmailEvent(user, requestId, redirectUrl));
		this._increaseResetUrlEmailCount(requestId);
	},

    sendEmailWithPasswordResetUrl: function(userId, requestId, redirectUrl) {
	var pwdTrackingManager = new SNC.PwdTrackingManager();
        var isRequestInvalid = pwdTrackingManager.isRequestInvalid(requestId);
        var processId = pwdTrackingManager.getProcessIdByRequestId(requestId);
        var resetUrlEmailLimitReached = this._isEmailLimitReached(processId, userId);
        if (isRequestInvalid || resetUrlEmailLimitReached) {
            if (resetUrlEmailLimitReached)
                this.verifyBL.logWarning("The maximum number of reset URL emails that can be sent within 24 hours has reached its limit", requestId);
            return true;
        }
        var user = this.validateUser(userId);
        if (user == undefined)
            return false;

        var hasRaisedEvent = this.raiseSendEmailEvent(user, requestId, redirectUrl);
        if (hasRaisedEvent)
            this._increaseResetUrlEmailCount(requestId);
        return hasRaisedEvent;
    },

	validateUser: function(userId) {
		var usr = new GlideRecord('sys_user');
		usr.addQuery('sys_id', userId);
		usr.addQuery('active', 'true');
		usr.queryNoDomain();
		if (!usr.next()) {
			gs.log("User : " + userId + " is eiter inactive or doesn't exist on the instance");
			return;
		}
		return usr;
	},

	raiseSendEmailEvent: function(user, requestId, redirectUrl) {
		var token = SNC.PasswordResetUtil.generateUniqueUserToken(user.sys_id);
		var resetPasswordURL = '';
		if (GlideStringUtil.notNil(token)) {
			resetPasswordURL = '/passwordreset.do?sysparm_id=' + user.sys_id + '&sysparm_request_id=' + requestId + '&sysparm_nostack=true&sysparm_token=' + token;
			if (redirectUrl) {
				resetPasswordURL = resetPasswordURL + '&sysparm_redirect_url=' + GlideSecurityUtils.cleanURL(redirectUrl);
			}
		} else {
			logError("Failed to generate unique token for user. Password reset failed for user : " + user.user_name);
			return false;
		}
		var eventName = 'password.reset.url';
		var shortenedURL = new GlideTinyURL().createTinyURLWithCustomLength(resetPasswordURL, 10);
		var passwordURL = this.getInstanceURL() + shortenedURL;
		var param1 = GlideProperties.get("glide.pwd_reset.onetime.token.validity", "1");
		var param2 = passwordURL;
		gs.eventQueue(eventName, user, param1, param2);
		return true;
	},

	getInstanceURL: function() {
		var url = gs.getProperty("glide.servlet.uri");
		var overrideUrl = gs.getProperty("glide.email.override.url");
		url = overrideUrl ? overrideUrl : url;
		if (GlideStringUtil.nil(url)) {
			gs.log("glide.servlet.url is empty!");
			return "";
		}
		url = url.trim();
		var len = url.length;
		if (url[len - 1] == '/')
			url = url.substring(0, len - 1);
		if (url.substring(len - 9, len) == "nav_to.do")
			url = url.substring(0, len - 10);

		return url;
	},

	getVerificationLabel: function(verificationId) {
		return new SNC.PwdVerification(verificationId).getLabel();
	},

	encryptWithKMFModule: function(password) {
		var kmfCryptoOperation = new sn_kmf_ns.KMFCryptoOperation(PwdConstants.PASSWORD_RESET_KMF_MODULE, PwdConstants.SYMMETRIC_WRAPPING).withAlgorithm(PwdConstants.AES_ALGORITHM).withInputFormat(PwdConstants.KMF_NONE);
		return kmfCryptoOperation.doOperation(password);
	},

	decryptWithKMFModule: function(encryptedPassword) {
		var kmfCryptoOperation = new sn_kmf_ns.KMFCryptoOperation(PwdConstants.PASSWORD_RESET_KMF_MODULE, PwdConstants.SYMMETRIC_UNWRAPPING).withAlgorithm(PwdConstants.AES_ALGORITHM).withOutputFormat(PwdConstants.KMF_NONE);
		return kmfCryptoOperation.doOperation(encryptedPassword);
	},

	useNotifyInPasswordReset: function() {
		var useNotify = GlideProperties.getBoolean('password_reset.sms.use_notify', true);
		return GlidePluginManager.isRegistered('com.snc.notify') && useNotify;
	},

	updateVerificationResult: function(user, verificationId, contextId, status, requestId) {
		requestId = gs.nil(requestId) ? '' : requestId;
		contextId = gs.nil(contextId) ? requestId : contextId;
		var requestToVerificationManager = new SNC.MapRequestToVerificationManager();
		requestToVerificationManager.createOrUpdate(contextId, verificationId, status);
	},

	_increaseResetUrlEmailCount: function(requestId) {
		var gr = new GlideRecord("pwd_reset_request");
		if (gr.get(requestId + '')) {
			gr.setValue("reset_url_email_count", gr.reset_url_email_count + 1);
			gr.update();
		}
	},

	_isEmailLimitReached: function(processId, userId) {
		var count = 0;
		var gdt = new GlideDateTime();
		gdt.addDaysLocalTime(-1);
		var maxLimit = gs.getProperty('password_reset.request.max_email', 3);
		var gr = new GlideRecord("pwd_reset_request");
		gr.addQuery("process", processId);
		gr.addQuery("user", userId);
		gr.query();
		while (gr.next()) {
			var createdDate = new GlideDateTime(gr.sys_created_on);
			if (createdDate.compareTo(gdt) == 1) //For requests created in a span of 24 hours
				count += gr.reset_url_email_count;
		}
		if (count > maxLimit)
			return true;
		return false;
	},

	isHistoryPolicyEnabledForLocalCredStore: function(credStoreId) {
		var credStore = new SNC.PwdCredentialStore(credStoreId);
		var isSupportHistoryEnabled = this._isSupportHistoryEnabled(credStore.getCredentialStoreTypeId());
		var enableHistoryPolicy = credStore.getEnforceHistoryPolicy();
		var credStoreParams = credStore.getCredentialStoreParams();
		var historyLimit = credStoreParams.get("password_history_limit");
		if (isSupportHistoryEnabled && enableHistoryPolicy && historyLimit)
			return true;
		else
			return false;
	},

	_isSupportHistoryEnabled: function(credStoreTypeID) {
		var gr = new GlideRecord("pwd_cred_store_type");
		if (gr.get(credStoreTypeID) && gr.supports_history_check)
			return true;
		return false;
	},

	type: 'PasswordResetUtil'
});
