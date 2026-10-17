var PwdVerifySMSProcessor = Class.create();

PwdVerifySMSProcessor.prototype = {
    category: 'password_reset.extension.verification_form_processor', // DO NOT REMOVE THIS LINE!

    /**********
     * Initialization stuff here...
     **********/
    initialize: function() {},

    /**********
     * Process the verification form request, and return whether the user was successfully verified
     * 
     * @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
     * @param params.userId         The sys-id of the user trying to be verified (table: sys_user)
     * @param params.verificationId The sys-id of the verification to be processed (table: pwd_verification)
     * @param request               The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
     * @return boolean telling whether the user is successfully verified
     **********/
    processForm: function(params, request) {
        var isVerified = false;
        try {
            isVerified = this.verify(params.resetRequestId, params.userId, params.verificationId, request);
        } catch (scriptErr) {
            gs.logError("[PwdVerifySMSProcessor.processForm]: '" + scriptErr + "'");
            isVerified = false;
        }
        return isVerified;
    },

    /*********
     * verify - returns true/false whether the user is verified for this verification method.
     *
     * Params:
	 * @reset_request_id - Password Reset Request Id or a Context id
     * @enrolled_user_id
     * @verification_id
     * @request - the request object that was submitted by the user in the verification form
     *********/
    verify: function(reset_request_id, enrolled_user_id, verification_id, request) {
        var LOG_ID = '[PwdVerifySMSProcessor.verify] ';
        // If request is password reset request or a context
        var requestExists = new SNC.PwdTrackingManager().requestExists(reset_request_id);
        var requestId = reset_request_id;
        var contextId = reset_request_id;
        if (!requestExists)
            requestId = '';

        var mode = request.getParameter('sysparm_sms_verification_mode');
        var answer = request.getParameter('sysparm_answer_sms_code').trim();
        gs.log(LOG_ID + "request_id: '" + reset_request_id + "', answer: '" + answer + "'");

        var result = false;
        var smsMgr = new PwdSMSNotificationManager();
        if (mode == 'subscription' || mode == 'mobile')
            result = smsMgr.verifyResetCode(reset_request_id, verification_id, answer);
        else
            gs.logError(LOG_ID + " unknown operation requested. request_id: '" + reset_request_id + "'");

        var status = result ? 'verified' : 'not_verified';
        var reqVerGr = new GlideRecord('pwd_map_request_to_verification');
        reqVerGr.addQuery('verification', verification_id);
        reqVerGr.addQuery('context_id', contextId);
        reqVerGr.query();
		
        var recordExists = reqVerGr.next();
        if (recordExists && reqVerGr.getValue('status') == 'verified')
             return true;

        var passwordResetUtil = new global.PasswordResetUtil();
        passwordResetUtil.updateVerificationResult(enrolled_user_id, verification_id, contextId, status, requestId);

        return result;
    },

    type: 'PwdVerifySMSProcessor'
};
