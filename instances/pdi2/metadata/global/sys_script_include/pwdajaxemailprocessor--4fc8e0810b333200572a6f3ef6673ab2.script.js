var PwdAjaxEmailProcessor = Class.create();
PwdAjaxEmailProcessor.prototype = Object.extendsObject(PwdAjaxNotificationProcessor, {

    /*
      Generate and send reset code for Email type
      Code would be sent to enrolled devices for subscription mode
      or profile device for notEnrolled mode
    */
    generateCode: function() {
        var requestId = this.getParameter("sysparm_request_id");
        var verificationId = this.getParameter("sysparm_verification_id");
        var mode = this.getParameter("sysparm_email_verification_mode");

        // Reject a request id that does not belong to this session's own reset request.
        if (!new PwdCommonUtils().isRequestBoundToSession(requestId)) {
            this._handleResponse(this.INVALID_REQUEST_RESPONSE, verificationId, requestId);
            return;
        }

        var response = new PwdUserEnrollmentServiceForEmail().generateCode(requestId,verificationId,mode);
        this._handleResponse(response, verificationId, requestId);
    },

    /**
     * Generates enrollment code for given email.
     */
    generateEnrollmentCode: function() {
        var deviceId = this.getParameter("sysparm_device_id");
        var verificationId = this.getParameter("sysparm_verification_id");

        var response = new PwdEmailNotificationManager().sendEnrollmentCode(deviceId, verificationId);

        this._handleResponse(response, verificationId, deviceId);
    },

    /**
     * Verify enrollment code for the given email address.
     */
    verifyEnrollmentCode: function() {
        var deviceId = this.getParameter("sysparm_device_id");
        var verificationId = this.getParameter("sysparm_verification_id");
        var userId = this.getParameter("sysparm_user_id");
        var code = this.getParameter("sysparm_email_code");

        var response = new PwdEmailNotificationManager().verifyEnrollmentCode(deviceId, verificationId, code);
        if (response)
            new global.PwdEnrollmentManager()._updateEnrollmentRecord(userId, verificationId, PwdConstants.ENROLLMENT_ACTIVE_STATUS);
        this._handleEnrollResponse(response, deviceId, userId);
    },

    type: 'PwdAjaxEmailProcessor'
});
