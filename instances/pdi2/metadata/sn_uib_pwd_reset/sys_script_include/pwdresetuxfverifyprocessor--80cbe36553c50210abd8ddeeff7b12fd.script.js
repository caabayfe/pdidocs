var PwdResetUXFVerifyProcessor = Class.create();
PwdResetUXFVerifyProcessor.prototype = {
    initialize: function() {
        this.userRequestDetails = new global.PwdCommonUtils().getUserRequestDetails();
    },

    getPageInfo: function(token, workspace) {
        var result;
        var securityResponse = new sn_uib_pwd_reset.PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!securityResponse.isValid) {
            result = this._getErrorTemplate();
            result.errorMessage = securityResponse.errorMessage;
            return result;
        }

        var userId = this.userRequestDetails.userId;
        var requestId = this.userRequestDetails.requestId;
        var processId = "";
        var processName = "";
        var requestGr = new GlideRecord("pwd_reset_request");
        if (!(gs.nil(requestId) || gs.nil(userId)) && requestGr.get(requestId)) {
            processId = requestGr.process;
            processName = requestGr.process.label + "";
        } else {
            result = this._getErrorTemplate();
            result.errorMessage = gs.getMessage("Password reset request does not exist");
            return result;
        }

        var verificationInfo = global.PwdVerificationSelectionHelper.getVerificationSelection(processId, userId, requestId);

        var mandatoryVerifications = verificationInfo.mandatory ? this._buildVerificationRouteArray(verificationInfo.mandatory, workspace, true) : [];
        if (mandatoryVerifications == null) {
            result = this._getErrorTemplate();
            result.errorMessage = gs.getMessage("Confguration issue, route for some verifications are not available");
            return result;
        }

        var optionalVerifications = verificationInfo.optional ? this._buildVerificationRouteArray(verificationInfo.optional, workspace, false) : [];
        if (optionalVerifications == null) {
            result = this._getErrorTemplate();
            result.errorMessage = gs.getMessage("Confguration issue, route for some verifications are not available");
            return result;
        }
        result = this._getSuccessTemplate();
        var mandatoryVerificationsCount = mandatoryVerifications.length;
        result.data.minimumSelection = Math.max(verificationInfo.min_selections, mandatoryVerificationsCount);
        var allVerifications = mandatoryVerifications.concat(optionalVerifications);
       
        if (verificationInfo.verification_selection === true) {
            result.data.isVerificationSelection = true;
        }
        result.data.verificationDetails = allVerifications;
        result.data.processName = processName;
        result.totalRetryCount = gs.getProperty("password_reset.request.max_attempt", 3);
        result.token = new global.PwdCommonUtils().generateCSRFToken();
        return result;
    },

    verifyUser: function(token, verificationId, userInputObj) {
        var result = this._getErrorTemplate();
        var securityResponse = new sn_uib_pwd_reset.PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!securityResponse.isValid) {
            result.errorMessage = securityResponse.errorMessage;
            return result;
        }
        data = {
            isRetry: false,
            retryCount: -1,
            status: "block"
        };
        var response = new global.PwdVerifyStageHandler().verifyUser(verificationId, userInputObj, true);
        if (response === "block" || response === "ok") {
            // response is block if request is inactive || request is not verified
            data.status = response;
        } else if (response.retry > 0) {
            data.isRetry = true;
            data.retryCount = response.retry;
            data.status = "";
        } else {
            // this happens when retry attempts are over and user is blocked
            data.retryCount = 0;
        }

        result.token = new global.PwdCommonUtils().generateCSRFToken();
        result.data = data;
        result.isValid = true;
        return result;
    },

    verifyAllVerifications: function(token, userInputObj) {
        var result = this._getErrorTemplate();
        var securityResponse = new sn_uib_pwd_reset.PwdResetUXFUtil().getSecurityValidationResult(token);
        if (!securityResponse.isValid) {
            result.errorMessage = securityResponse.errorMessage;
            return result;
        }

        var response = new global.PwdVerifyStageHandler().verifyUser(null, userInputObj, true);
        if (response !== "ok") {
            result.errorMessage = gs.getMessage("Unable to connect to the server. Try again.");
            return result;
        }

        var requestId = this.userRequestDetails.requestId;
        var gr = new GlideRecord("pwd_reset_request");
        if (!gr.get(requestId)) {
            result.errorMessage = gs.getMessage("Password reset request does not exist");
            return result;
        }

        var isEmailURLEnabled = Boolean(gr.process.email_password_reset_url);
        var redirectURL = String(gr.process.redirect_url);
        if (isEmailURLEnabled) {
            var respUtilityObj = new global.PwdCommonVerificationHandler().sendEmailWithPasswordResetUrl(this.userRequestDetails.userId, requestId, token, redirectURL);
            if (respUtilityObj.isError()) {
                result.errorMessage = respUtilityObj.getStatusMessage();
                return result;
            }
        }
        result.isValid = true;
        result.isEmailURLEnabled = isEmailURLEnabled;
        return result;
    },

    _buildVerificationRouteArray: function(verifications, workspace, isMandatory) {
        var verificationGr = new GlideRecord("pwd_verification");
        var result = [];
        for (var i = 0; i < verifications.length; i++) {
            if (verificationGr.get(verifications[i])) {
                var route = this._getVerificationRoute(verificationGr.type.sys_id, workspace);
                if (!route) {
                    return null;
                }
                result.push({
                    verificationId: verifications[i],
                    verificationLabel: verificationGr.label + "",
                    route: route + "",
                    isMandatory: isMandatory,
                    isChecked: isMandatory
                });
            } else {
                return null;
            }
        }
        return result;
    },

    _getVerificationRoute: function(verificationTypeId, workspace) {
        var route = null;
        var verificationRouteMapGr = new GlideRecord("pwd_reset_uxf_route_mapping");
        verificationRouteMapGr.addQuery("verification_type", verificationTypeId);
        verificationRouteMapGr.orderBy("order");
        verificationRouteMapGr.query();

        while (verificationRouteMapGr.next()) {
            if (gs.nil(workspace)) {
                if (gs.nil(verificationRouteMapGr.workspace))
                    return verificationRouteMapGr.route.route_type;
            } else {
                if (verificationRouteMapGr.workspace == workspace)
                    return verificationRouteMapGr.route.route_type;

                else if (gs.nil(verificationRouteMapGr.workspace) && route == null)
                    route = verificationRouteMapGr.route.route_type;
            }
        }
        return route;
    },

    _getErrorTemplate: function() {
        return {
            isValid: false,
            errorMessage: ""
        };
    },

    _getSuccessTemplate: function() {
        return {
            isValid: true,
            token: null,
            totalRetryCount: "",
            data: {
                isVerificationSelection: false,
                verificationDetails: [],
                minimumSelection: null,
                processName: "",
                maxAttemptWindow: gs.getProperty("password_reset.request.max_attempt_window", "")
            }
        };
    },

    type: 'PwdResetUXFVerifyProcessor'
};
