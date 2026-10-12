var PwdResetCommonUXFVerificationProcessor = Class.create();
PwdResetCommonUXFVerificationProcessor.prototype = {
    initialize: function() {
        this.userRequestDetails = new global.PwdCommonUtils().getUserRequestDetails();
    },

    getPersonalConfirmationVerificationDetails: function(verificationId, token) {
        var result = new sn_uib_pwd_reset.PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!result.isValid)
            return result;
        if (gs.nil(verificationId)) {
            result.isValid = false;
            result.errorMessage = gs.getMessage("Invalid Verification Id");
            return result;
        }
        result = this._getSuccessTemplateForPersonalDataConfirmation();
        var pwdCommonVerificationHandlerObj = new global.PwdCommonVerificationHandler();
        result.label = pwdCommonVerificationHandlerObj.getVerificationLabel(verificationId);
        result.question = pwdCommonVerificationHandlerObj.getPersonalDataLabel(verificationId);
        result.answer = pwdCommonVerificationHandlerObj.getPersonalDataConfirmationAnswer(verificationId);
        return result;
    },

    getPersonalDataVerificationDetails: function(verificationId, token) {
        var result = new sn_uib_pwd_reset.PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!result.isValid)
            return result;
        if (gs.nil(verificationId)) {
            result.isValid = false;
            result.errorMessage = gs.getMessage("Invalid Verification Id");
            return result;
        }
        result = this._getSuccessTemplateForPersonalDataVerification();
        var pwdCommonVerificationHandlerObj = new global.PwdCommonVerificationHandler();
        result.label = pwdCommonVerificationHandlerObj.getVerificationLabel(verificationId);
        result.question = pwdCommonVerificationHandlerObj.getPersonalDataLabel(verificationId);
        return result;
    },

    getSecurityQuestionVerificationDetails: function(token, verificationId) {
        var result = this._getErrorTemplate();
        var securityResponse = new sn_uib_pwd_reset.PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!securityResponse.isValid) {
            result.errorMessage = securityResponse.errorMessage;
            return result;
        }
        var userId = this.userRequestDetails.userId;
        var requestId = this.userRequestDetails.requestId;
        var pwdCommonVerificationHandler = new global.PwdCommonVerificationHandler();
        var label = pwdCommonVerificationHandler.getVerificationLabel(verificationId);
        var questionObj = pwdCommonVerificationHandler.getRandomQuestions(requestId, userId, verificationId);
        if (gs.nil(label) || gs.nil(questionObj)) {
            result.errorMessage = gs.getMessage("Configuration issue in Security Question verification.");
            return result;
        }
        result = this._getSuccessTemplateForSecurityQuestionVerification();
        var questions = [];
        for (var i = 0; i < questionObj.q_id.length; i++) {
            var question = {
                id: questionObj.q_id[i],
                text: questionObj.q[i]
            };
            questions.push(question);
        }
        result.data.questions = questions;
        result.data.label = label;
        return result;
    },

    _getErrorTemplate: function() {
        return {
            isValid: false,
            errorMessage: "",
            errorHeading: ""
        };
    },

    _getSuccessTemplateForPersonalDataConfirmation: function() {
        return {
            isValid: true,
            question: null,
            answer: null,
            label: null
        };
    },

    _getSuccessTemplateForPersonalDataVerification: function() {
        return {
            isValid: true,
            question: null,
            label: null
        };
    },

    _getSuccessTemplateForSecurityQuestionVerification: function() {
        return {
            isValid: true,
            data: {
                label: "",
                questions: []
            }
        };
    },

    type: 'PwdResetCommonUXFVerificationProcessor'
};
