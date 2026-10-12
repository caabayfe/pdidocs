var PwdVerifyStageBL = Class.create();
PwdVerifyStageBL.prototype = Object.extendsObject(PwdResetStageBaseBL, {

    verificationMgr: new SNC.PwdVerificationManager(),

    PERSONAL_DATA_VERIFICATION_TYPE_ID: "2f39b371eb1101004d7763fba206fed1",
    PERSONAL_DATA_CONFIRMATION_VERIFICATION_TYPE_ID: "a7f17087eb1101004d7763fba206fe52",

    PWD_RESET_NOTITIFICATION_EVENT: 'pwd.reset.verify.error.notification',
    REQUEST_INVALID: true,
	PENDING_WITH_EXTERNAL_SYSTEM_STATUS: '3',
	INVALID_REASON: 8, // Set reason as Verification Failed

    initialize: function() {
        this.STAGE = PwdConstants.STAGE_VERIFICATION;
        this.optionalVerification = false;
    },

    /** Check a single verification and return true if valid or false if invalid 
    	@return {boolean} 
    */
    checkVerification: function(userId, processId, verificationId, requestId, webRequestObj) {
        var verificationTypeId = this.verificationMgr.getVerificationTypeIdByVerificationId(verificationId);
        var verificationType = new SNC.PwdVerificationType(verificationTypeId);
        if (!verificationType.exists()) {
            var invalidVerificationType = "Invalid verification type (process_id = " + processId + ", verification = " + verificationId + ")";
            this.logError(invalidVerificationType, requestId);

            return false;
        }

        var verificationProcessorId = verificationType.getVerificationProcessorId();
        if (!verificationProcessorId) {
            var invalidVerificationProc = "Invalid verification processor (process_id = " + processId + ", verification = " + verificationId + ")";
            this.logError(invalidVerificationProc, requestId);

            return false;
        }

        try {
            // Include the specific processor, and invoke its "verify" method

            // Published interface to verification form processor extensions
            //
            // @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
            // @param params.userId         The sys-id of the user trying to be verified (table: sys_user)
            // @param params.verificationId The sys-id of the verification to be processed (table: pwd_verification)
            // @param request               The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
            // @return boolean telling whether the user is successfully verified

            var verificationParams = new SNC.PwdExtensionScriptParameter();
            verificationParams.resetRequestId = requestId;
            verificationParams.userId = userId;
            verificationParams.verificationId = verificationId;

            var verificationProcessorExtension = new SNC.PwdExtensionScript(verificationProcessorId);
            var extensionResult = verificationProcessorExtension.processForm(verificationParams, webRequestObj);
            var verificationResult;
            // If we didn't get the expected return type back, we mark this verification process as failed
            if (typeof(extensionResult) == 'boolean') {
                verificationResult = extensionResult;
            } else {
                gs.logWarning('Unexpected verification processor extension result: ' + extensionResult, 'PwdAjaxVerifyProcessor');
                verificationResult = false;
            }
            var isRequestInvalid = this.trackingMgr.isRequestInvalid(requestId);
			var isServiceDesk = this.trackingMgr.isServiceDesk(requestId);
            if ((verificationTypeId == this.PERSONAL_DATA_VERIFICATION_TYPE_ID || verificationTypeId == this.PERSONAL_DATA_CONFIRMATION_VERIFICATION_TYPE_ID) && !isServiceDesk && !this.optionalVerification) {
                if (!verificationResult) {
                    this._ifPersonalDataFailed(isRequestInvalid, userId, requestId, verificationId);
                }
                return true;
            } else {
                if (verificationResult && isRequestInvalid) {
                    return this._ifPersonalDataFailedAndMFAPassed(requestId, verificationId);
                } else if (!verificationResult && !gs.nil(new SNC.PwdTrackingManager().getUserName(requestId))) //If MFA failed and user is valid then log the activity
                    return this._ifMFAFailed(requestId, verificationId);
            }

            return verificationResult;
        } catch (err) {
            // Most likely the processing script does not exist!
            var errorMsg = "Cannot process verification (verification_id = " + verificationId + ") + [" + err + "]";
            this.logError(errorMsg, requestId);

            return false;
        }
    },

    /** Check all verifications associated with the given process and return true if all are valid
    	Also saves the state that the user is verified to allow going beyond the Verify page
    	@return {boolean} 
    */
    checkAllVerifications: function(userId, processId, requestId, webRequestObj) {
        var VERIFIED = 2; // check out: "com.glideapp.password_reset.model.Request" for status enumerations.
        var NOTVERIFIED = 4;
        var validVerificationsCount = 0;
        var processMgr = new SNC.PwdProcessManager();

        var verificationId;
        var invalidVerificationMsg;
        var isValid;


        // -------------------------------------------------------
        // Handle all the MANDATORY verifications associated with this process:
        // -------------------------------------------------------
        var mandatoryVerificationIds = processMgr.getProcessVerificationIdsByMandatoryFlag(processId, true);
        for (var i = 0; i < mandatoryVerificationIds.size(); i++) {
            verificationId = mandatoryVerificationIds.get(i);

            if (!verificationId) {
                invalidVerificationMsg = "Invalid verification (process_id = " + processId + ", verification = " + i + ")";
                this.logError(invalidVerificationMsg, requestId);
                return "invalid verification in process";
            }

            isValid = this.checkVerification(userId, processId, verificationId, requestId, webRequestObj);

            if (!isValid)
                return false;

            ++validVerificationsCount;
        }
        // --------------------- END MANDATORY SECTION ---------------------

        // -------------------------------------------------------
        // Handle all the OPTIONAL verifications associated with this process:
        // -------------------------------------------------------

        var optionalVerificationIds = processMgr.getProcessVerificationIdsByMandatoryFlag(processId, false);
        this.optionalVerification = true;
        for (i = 0; i < optionalVerificationIds.size(); i++) {
            verificationId = optionalVerificationIds.get(i);

            if (!verificationId) {
                invalidVerificationMsg = "Invalid verification (process_id = " + processId + ", verification = " + i + ")";
                this.logError(invalidVerificationMsg, requestId);
                return "invalid verification in process";
            }
            isValid = this.checkVerification(userId, processId, verificationId, requestId, webRequestObj);
            if (isValid)
                validVerificationsCount++;
            if (validVerificationsCount == new SNC.PwdProcess(processId).getMinVerifications())
				break;
        }
        // --------------------- END OPTIONAL SECTION ---------------------

        if (validVerificationsCount >= new SNC.PwdProcess(processId).getMinVerifications()) {
            // Log successful verification
            gs.getSession().putProperty('sysparm_is_verified', true);
            var isRequestInvalid = this.trackingMgr.isRequestInvalid(requestId);
            var userName = this.trackingMgr.getUserName(requestId);
            var requestStatus = this.trackingMgr.getRequestStatus(requestId);
            if (requestStatus != this.PENDING_WITH_EXTERNAL_SYSTEM_STATUS) {
                if (isRequestInvalid) {
                    this.trackingMgr.updateRequestStatus(requestId, NOTVERIFIED);
                    if (!gs.nil(userName))
                        this.logInfo("User is not verified", requestId);
                } else if (!new SNC.PwdProcess(processId).getEmailPasswordResetUrl()) {
                    this.trackingMgr.updateRequestStatus(requestId, VERIFIED);
                    this.logInfo("User verified successfully", requestId);
                }
            }
            return true;
        }
        return false;
    },

    _ifPersonalDataFailed: function(isRequestInvalid, userId, requestId, verificationId) {
        var userName = this.trackingMgr.getUserName(requestId);
        if (!isRequestInvalid && !gs.nil(userName)) {
            var gr = new GlideRecord("pwd_reset_request");
            gr.get(requestId);
            gs.eventQueue(this.PWD_RESET_NOTITIFICATION_EVENT, gr, userId, null);
        }
        this.logWarning("Verification failed", requestId, 'pwd_verification', verificationId);
        this.trackingMgr.updateRequestInvalid(requestId, this.REQUEST_INVALID, this.INVALID_REASON);
    },

    _ifPersonalDataFailedAndMFAPassed: function(requestId, verificationId) {
        this.logWarning("Verification failed as it is invalid request", requestId, 'pwd_verification', verificationId);
        return false;
    },
	
    _ifMFAFailed: function(requestId, verificationId) {
        this.logWarning("Verification failed", requestId, 'pwd_verification', verificationId);
        return false;
    },

    type: 'PwdVerifyStageBL'
});
