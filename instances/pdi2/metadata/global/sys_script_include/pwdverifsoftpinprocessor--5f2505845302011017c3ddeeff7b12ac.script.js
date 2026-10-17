var PwdVerifSoftPINProcessor = Class.create();
PwdVerifSoftPINProcessor.prototype = {
    category: 'password_reset.extension.verification_form_processor', // DO NOT REMOVE THIS LINE!

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

        var userId = params.userId;
        var verificationId = params.verificationId;
        var requestId = params.resetRequestId;

        var providedPIN = request.getParameter('sysparm_softpin');
        var isEncrypted = request.getParameter("isEncrypted");
        isEncrypted = gs.nil(isEncrypted) ? false : isEncrypted;

        var contextId = request.getParameter('context_id');

        //Find out requestId is a valid Password Reset Request or not
        var requestExists = new SNC.PwdTrackingManager().requestExists(requestId);
        if (requestExists)
            contextId = requestId;
        else
            requestId = '';

        //Validate SoftPIN
        var softPINManager = new SNC.PwdSoftPINManager();
        var verificationStatus = softPINManager.isValid(params.userId, params.verificationId, providedPIN, isEncrypted);

        //Request to Validation Result 
        var status = verificationStatus ? 'verified' : 'not_verified';
        var passwordResetUtil = new global.PasswordResetUtil();
        passwordResetUtil.updateVerificationResult(userId, verificationId, contextId, status, requestId);
        return verificationStatus;
    },

    type: 'PwdVerifSoftPINProcessor'

};
