var PwdAjaxVerifyProcessor = Class.create();

PwdAjaxVerifyProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
    verifyStageHandler: new PwdVerifyStageHandler(),
    verifyBL: new PwdVerifyStageBL(),
    isPublic: function() {
        return true;
    },

    /************
     * pwdAjaxVerifyProcessor() - Server side Ajax processor for verifying the user (iterate through the various verification methods).
     *
     * Required Properties:
     *  @sysparm_enrolled_user_id - a "session" property containing the enrolled user id.
     *  @sysparm_request_id       - a "session" property containing the request id.
     *
     * Return value:
     * "ok"     - if user is verified (by ALL verification methods).
     * "block"  - If too many attempts where made, and we'd like to block this user.
     * <error>  - Any other string, with the error (reason for failing); For example: "No request info found".
     *
     ***********/
    /* eslint-disable consistent-return */
    pwdAjaxVerifyProcessor: function() {
        // check the security before anything else.
        // If any violation is found, then just return.
        if (!this._validateSecurity())
            return;

		var verificationId = this.getParameter('sysparm_verification_id');
		var response = this.verifyStageHandler.verifyUser(verificationId,this.request);
		if(response !== "block" && response !== "ok"){
			return this._handleRetry(response.requestId, response.userInput, response.processId, response.verificationId, response.userId, response.retry);
		}
		return response;
    },

    /* eslint-enable consistent-return */

    _handleRetry: function(requestId, userInput, processId, verificationId, userId,retry) {
        var retryResponse = this.newItem("retry");
        retryResponse.setAttribute("count", retry);

        if (retry < 0) {
            this.verifyBL.logWarning("Maximum retries reached, blocking user", requestId);
            return "block";
        }
        /* Check to see if there is a retry macro that we want to compute. Right now, only QA verification type has this
         * 2 cases to check:
         *    1. Verification ID is known - check just that verification
         *    2. Verification ID is unknown - check all the verifications for the process. 
         */
        var verificationsToCheck = gs.nil(verificationId) ? new SNC.PwdProcessManager().getVerificationIdsByProcessId(processId) : [verificationId];
        var qaVerGr = new GlideRecord('pwd_verification');
        qaVerGr.addQuery('type', PwdConstants.QA_VERIFICATION_TYPE_ID );
        qaVerGr.addQuery('sys_id', 'IN', verificationsToCheck);
        qaVerGr.query();

        if (qaVerGr.next()) {
            var verificationType = new SNC.PwdVerificationType(PwdConstants.QA_VERIFICATION_TYPE_ID );
            var macroName = verificationType.getVerificationUI();
            var jellyRunner = new GlideJellyRunner();

            jellyRunner.setVariable('sysparm_verification_id', qaVerGr.getUniqueValue());
            jellyRunner.setVariable('sysparm_sys_user_id', userId);
            jellyRunner.setVariable('sysparm_request_id', requestId);
            retryResponse.setAttribute("retry_macro", jellyRunner.runMacro(macroName));
        }
        

        // Return the user info that user typed in on the identify page			
        return GlideStringUtil.escapeHTML(userInput);
    },

    type: 'PwdAjaxVerifyProcessor'
});
