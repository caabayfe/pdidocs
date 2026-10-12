var PwdResetUXFIdentifyProcessor = Class.create();
PwdResetUXFIdentifyProcessor.prototype = {
    initialize: function() {
        this.pwdResetUxfUtil = new PwdResetUXFUtil();
    },

    constants: {
        RPA_CRED_STORE_TYPE_ID: "4e1537b5436602107524354d3ab8f2f6",
        SOFT_PIN_VERIFICATION_TYPE_ID: "a67585845302011017c3ddeeff7b1267",
        PROC_TO_VERIFICATION_TABLE: "pwd_map_proc_to_verification",
        PROCESS_FIELD: "process"
    },

    identifyUser: function(userSysId, processSysId, token) {
        var result = {
            isValid: false
        };
        var errorMessage = {};
        result.tokenValidationResult = this.pwdResetUxfUtil.getSecurityValidationResult(token);
        if (!result.tokenValidationResult.isValid)
            return result;
        var identifyRespUtilityObj = new global.PwdIdentifyStageHandler().identifyUserForServiceDesk(userSysId, processSysId);
        var isError = identifyRespUtilityObj.isError();
        if (isError) {
            var statusCode = identifyRespUtilityObj.getStatusCode();
            errorMessage.info = identifyRespUtilityObj.getStatusMessage();
            if (statusCode == 1000) {
                errorMessage.header = gs.getMessage("User not enrolled!");
            }
            result.errorMessage = errorMessage;
            return result;
        }
        result.isValid = true;
        return result;
    },

    getToken: function() {
        return {
            token: new global.PwdCommonUtils().generateCSRFToken()
        };
    },

    getProcess: function(userSysId) {
        var processInfo = [];
        if (gs.nil(userSysId))
            return processInfo;

        processInfo = new global.PwdIdentifyStageHandler().getProcessesForUser(userSysId);

        return processInfo.filter(function(process) { //filter all the processes that are not supported in UIB
            return !this._isProcessNotSupportedOverUXF(process.procSysId);
        }, this);
    },

    _isProcessNotSupportedOverUXF: function(process) {
        var gr = new GlideRecord(this.constants.PROC_TO_VERIFICATION_TABLE);
        gr.addQuery(this.constants.PROCESS_FIELD, process);
        gr.query();

        while (gr.next()) {
            var verificationId = gr.verification.type + "";
            var credStoreTyepId = gr.process.cred_store.type + "";
            if (verificationId === this.constants.SOFT_PIN_VERIFICATION_TYPE_ID || credStoreTyepId === this.constants.RPA_CRED_STORE_TYPE_ID)
                return true;
        }
        return false;
    },

    type: 'PwdResetUXFIdentifyProcessor'
};
