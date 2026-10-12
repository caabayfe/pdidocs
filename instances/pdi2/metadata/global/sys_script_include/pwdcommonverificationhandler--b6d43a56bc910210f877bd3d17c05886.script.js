var PwdCommonVerificationHandler = Class.create();
PwdCommonVerificationHandler.prototype = {
    initialize: function() {},
    pwdResetRespConst: new PasswordResetResponseConstants(),
    trackingMgr: new SNC.PwdTrackingManager(),

    //Given a verification ID, it returns the localized verification label
    getVerificationLabel: function(verificationId) {
        if (gs.nil(verificationId))
            return null;
        return new SNC.PwdVerification(verificationId).getLabel();
    },

    //Given personal data verification/confirmation Id, it returns input field localized label
    getPersonalDataLabel: function(verificationId) {
        if (gs.nil(verificationId))
            return null;
        var paramValue = new SNC.PwdVerificationManager().getVerificationParamValue(verificationId, 'label');
        return gs.getMessage(paramValue);
    },

    //Given personal data confirmation Id, it returns answer
    getPersonalDataConfirmationAnswer: function(verificationId) {
        if (gs.nil(verificationId))
            return null;
        var column = new SNC.PwdVerificationManager().getVerificationParamValue(verificationId, 'column');

        var gr = new GlideRecord("sys_user");
        var user_id = gs.getSession().getProperty('sysparm_sys_user_id');
        var valueFromDB = user_id;
        if (gr.get(user_id)) {
            valueFromDB = gr.getDisplayValue(column);
            if (valueFromDB == "") {
                valueFromDB = gs.getMessage("Not found");
            }
        } else if (column == 'email') {
            valueFromDB += "@example.com";
        }

        return valueFromDB;
    },

    /*Given question-answer verification Id, it returns questions
    {
        "q_id": [], //questions sys_ids
        "q": []	//questions
    }*/
    getRandomQuestions: function(requestId, userId, verificationId) {
        if (gs.nil(requestId) || gs.nil(userId) || gs.nil(verificationId))
            return null;

        var num_reset = 0,
            num_enroll = 0,
            name, value;
        var grParam = new GlideRecord('pwd_verification_param');
        grParam.addQuery('verification', verificationId);
        grParam.query();
        while (grParam.next()) {
            name = grParam.getValue('name');
            value = grParam.getValue('value');
            if (name == 'num_reset')
                num_reset = parseInt(value);
            else if (name == 'num_enroll')
                num_enroll = parseInt(value);
            else {
                this.trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_VERIFICATION, this.pwdResetRespConst.QA_PARAM_ERROR, requestId);
                return null;
            }
        }

        var pwdQuestionAnswerHelper = new global.PwdQuestionAnswerHelper();
        var enrolledQuestions = pwdQuestionAnswerHelper.getQuestionsList(requestId, userId, verificationId, num_reset, num_enroll);

        if (num_reset > enrolledQuestions.q_id.length) {
            this.trackingMgr.createActivity(PwdConstants.TYPE_ERROR, PwdConstants.STAGE_VERIFICATION, this.pwdResetRespConst.QA_INSUFFICIENT_QUESTIONS_ERROR, requestId);
            return null;
        }

        var randomQuestions = {
            "q_id": [],
            "q": []
        };
        for (var i = 0; i != num_reset; i++) {
            var item = Math.floor(Math.random() * enrolledQuestions.q_id.length);
            randomQuestions.q_id.push(enrolledQuestions.q_id.splice(item, 1)[0]);
            randomQuestions.q.push(enrolledQuestions.q.splice(item, 1)[0]);
        }
        return randomQuestions;
    },

    //Given Soft PIN verification Id, it returns Soft PIN question localized label
    getSoftPINQuestion: function(verificationId) {
        if (gs.nil(verificationId))
            return null;
        var question = new SNC.PwdSoftPINManager().getQuestion(verificationId);
        return gs.getMessage(question);
    },

    //Triggers the Password reset URL over Email/SMS
    sendEmailWithPasswordResetUrl: function(userId, requestId, token, redirectUrl) {
        var pwdResetResponseUtility = new global.PasswordResetResponseUtility();

        if (gs.nil(userId) || gs.nil(requestId) || gs.nil(token)) {
            pwdResetResponseUtility.setError(this.pwdResetRespConst.DEFAULT_ERROR_CODE);
            return pwdResetResponseUtility;
        }

        var isTokenValidated = new global.PwdCommonUtils().validateCSRFToken(token);
        if (!isTokenValidated) {
            pwdResetResponseUtility.setError(this.pwdResetRespConst.SECURITY_VIOLATION_ERROR_CODE);
            return pwdResetResponseUtility;
        }
        var hasEmailSent = new global.PasswordResetUtil().sendEmailWithPasswordResetUrl(userId, requestId, redirectUrl);

        if (!hasEmailSent) {
            pwdResetResponseUtility.setError(this.pwdResetRespConst.RESET_URL_EMAIL_SENT_ERROR_CODE);
            return pwdResetResponseUtility;
        }
        pwdResetResponseUtility.setSuccess(this.pwdResetRespConst.RESET_URL_EMAIL_SENT_SUCCESS_CODE);
        return pwdResetResponseUtility;
    },

    type: 'PwdCommonVerificationHandler'
};
