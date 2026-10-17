var PwdProcessStrengthCalculatorUtilSNC = Class.create();
PwdProcessStrengthCalculatorUtilSNC.prototype = {
    initialize: function() {},
    pwdProcess: null,
    pwdCredStore: null,
    credStoreTypeGR: null,
    totalScore: 0,
    suggestions: [],
    VERIFICATON_MAX_SCORE: 40,
    NORMALIZATION_FACTOR: 1.25,
    isPasswordPolicyRequired: true,
    securityLevelToScoreMap: {
        100: 0, //Low
        200: 15, //Medium
        300: 25 //High
    },

    /*
	returns
		{
			identificationScore:,
			verificationScore:,
			ConfigurationScore:, 
			policyScore:,
			securityScore:,
			suggestions: []
		}
	*/
    getProcessStrength: function(processId) {
        if (gs.nil(processId))
            return;

        this.pwdProcess = new SNC.PwdProcess(processId);

        var isResetEnabled = this.pwdProcess.isResetPwd();
        var isUnlockEnabled = this.pwdProcess.isUnlockAccount();
        if (!this.pwdProcess.isPublic() || (!isResetEnabled && !isUnlockEnabled))
            return;

        this.pwdCredStore = new SNC.PwdCredentialStore(this.pwdProcess.getCredentialStoreId());
        var credStoreTypeID = this.pwdCredStore.getCredentialStoreTypeId();

        if (gs.nil(credStoreTypeID))
            return;

        this.credStoreTypeGR = new GlideRecord('pwd_cred_store_type');
        if (!this.credStoreTypeGR.get(credStoreTypeID))
            return;

	//If we are sending the reset URL over Email/SMS then the verification having low security level will have 10 score otherwise 0 score
        if (this.pwdProcess.getEmailPasswordResetUrl())
            this.securityLevelToScoreMap[100] = 10;
        else
            this.securityLevelToScoreMap[100] = 0;

        var acceptPassword = this.credStoreTypeGR.use_flow == true ? (this.credStoreTypeGR.password_delivery_mechanism.nil() || this.credStoreTypeGR.password_delivery_mechanism == '0') : true;
        this.isPasswordPolicyRequired = acceptPassword && isResetEnabled;

        return JSON.stringify({
            'identificationScore': this._getIdentificationScore(),
            'verificationScore': this._getVerificationScore(processId),
            'ConfigurationScore': this._getConfigurationScore(),
            'policyScore': this._getPolicyScore(processId),
            'securityScore': this.totalScore,
            'suggestions': this.suggestions
        });
    },

    sendConfigSecurityScoreNotification: function() {
        var processOwnersToProcessMap = {};
        var processGR = new GlideRecord("pwd_process");
        processGR.query();

        while (processGR.next()) {
            this.totalScore = 0;
            this.suggestions = [];
            var processID = processGR.getUniqueValue();

            //security score is not applicable ie process is either service desk or only change password is enabled
            if (gs.nil(this.getProcessStrength(processID))) {
                processGR.security_score = '';
                processGR.update();
                continue;
            }

            var isUpdateRequired = false;
            if (gs.nil(processGR.security_score) || processGR.security_score != this.totalScore) {
                processGR.security_score = this.totalScore;
                isUpdateRequired = true;
            }

            if (processGR.enable_security_score_notification == true && gs.nil(processGR.process_owner)) {
                var processOwners = this._getUsersWithPasswordResetAdminRole();
                if (processOwners) {
                    processGR.process_owner = processOwners;
                    isUpdateRequired = true;
                }
            }

            if (isUpdateRequired)
                processGR.update();

            if (processGR.active == true && processGR.enable_security_score_notification == true && !gs.nil(processGR.process_owner)) {
                processOwners = processGR.process_owner.split(",");
                for (var i = 0; i < processOwners.length; i++) {
                    if (!processOwnersToProcessMap[processOwners[i]])
                        processOwnersToProcessMap[processOwners[i]] = [];

                    processOwnersToProcessMap[processOwners[i]].push({
                        "processID": processID,
                        "processName": processGR.name + "",
                        "securityScore": this.totalScore,
                        "suggestions": this.suggestions
                    });

                }
            }
        }

        if (Object.keys(processOwnersToProcessMap).length !== 0) {
            for (var owner in processOwnersToProcessMap) {
                if (processOwnersToProcessMap.hasOwnProperty(owner))
                    gs.eventQueue('pwd.process_security_score_notification', null, owner, JSON.stringify(processOwnersToProcessMap[owner]));
            }

        }
    },

    _getUsersWithPasswordResetAdminRole: function() {
        var users = [];
        var query = "user.emailISNOTEMPTY";
        var userRoleGR = new GlideRecord("sys_user_has_role");
        userRoleGR.addQuery("role", "550f7228ebd0010045e1a5115206fe41");
        userRoleGR.addQuery("user.active", true);
        userRoleGR.addEncodedQuery(query);
        userRoleGR.query();
        while (userRoleGR.next()) {
            users.push(userRoleGR.user + "");
        }
        return users + "";
    },

    _getIdentificationScore: function() {
        if (this.pwdProcess.getIdentificationTypeIds().size() > 1) {
            identificationTotal = 10;
        } else {
            identificationTotal = 5;
            this.suggestions.push(gs.getMessage('Enable multi identifications'));
        }

        if (this.pwdProcess.getDisplayCaptcha())
            identificationTotal += 10;
        else {
            this.suggestions.push(gs.getMessage('Enable CAPTCHA on the process.'));
        }

        this.totalScore += identificationTotal;
        return identificationTotal;
    },

    _getVerificationScore: function(processId) {
        var verificationTotal = 0;

        var minimumVerifications = this.pwdProcess.getMinVerifications();
        var pwdProcessManager = new SNC.PwdProcessManager();
        var mandatoryVerifications = pwdProcessManager.getProcessVerificationIdsByMandatoryFlag(processId, true);
        var mandatoryVerificationsLength = mandatoryVerifications.size();
        for (var i = 0; i < mandatoryVerificationsLength; i++) {
            var verification = mandatoryVerifications.get(i);
            var pwdVerificationManager = new SNC.PwdVerificationManager();
            var verificationType = pwdVerificationManager.getVerificationTypeIdByVerificationId(verification);

            var PwdVerificationType = new SNC.PwdVerificationType(verificationType);
            verificationTotal += this.securityLevelToScoreMap[PwdVerificationType.getSecurityLevel()];
        }

        if (verificationTotal >= this.VERIFICATON_MAX_SCORE) {
            this.totalScore += this.VERIFICATON_MAX_SCORE;
            return this.VERIFICATON_MAX_SCORE;
        }

        if (mandatoryVerificationsLength < minimumVerifications) { //if optional verifications required then we need to consider the verification with least security first
            var optionalVerifications = pwdProcessManager.getProcessVerificationIdsByMandatoryFlag(processId, false);
            var count = minimumVerifications - mandatoryVerificationsLength;

            var gr = new GlideRecord("pwd_verification");
            gr.addQuery("sys_id", "IN", optionalVerifications);
            gr.orderBy("type.security_level"); //sort the optional verifications by security level
            gr.query();

            while (gr.next() && verificationTotal <= this.VERIFICATON_MAX_SCORE && count > 0) {
                verificationTotal += this.securityLevelToScoreMap[gr.type.security_level];
                count--;
            }
            if (verificationTotal >= this.VERIFICATON_MAX_SCORE)
                verificationTotal = this.VERIFICATON_MAX_SCORE;
        }

        if (verificationTotal < 30)
            this.suggestions.push(gs.getMessage('Map at least two verifications to this process with the medium or high security level.'));

        this.totalScore += verificationTotal;
        return verificationTotal;
    },

    _getConfigurationScore: function() {
        var processConfigTotal = 0;
        if (this.pwdProcess.getEmailPasswordResetUrl())
            processConfigTotal = 20;
        else if (this.pwdProcess.isAutoGenPassword())
            processConfigTotal = 20;
        else {
            this.suggestions.push(gs.getMessage("Either use the Email/SMS Password Reset URL or Auto-generate password option."));
            processConfigTotal = 10;
        }

        this.totalScore += processConfigTotal;
        return processConfigTotal;
    },

    _getPolicyScore: function(processId) {
        // if password policy step is not applicable then normalize the remaining steps score to 100
        if (!this.isPasswordPolicyRequired) {
            this._normalizeTotalScore();
            return 0;
        }

        var policySuggestion = null;
        var historyPolicy = 0;
        var passwordPolicy = 10;

        var supportHistoryPolicy = this.credStoreTypeGR.getValue("supports_history_check") == 1;

        if (supportHistoryPolicy) {
            if (this.pwdCredStore.getEnforceHistoryPolicy())
                historyPolicy = 5;
            else
                policySuggestion = gs.getMessage('Select Enforce history policy on the credential store.');
        } else
            passwordPolicy = 15;

        var pwdCredentialStoreManager = new SNC.PwdCredentialStoreManager();

        if (pwdCredentialStoreManager.getEnablePasswordPolicy(processId))
            passwordPolicy = this._getPolicyStrength(pwdCredentialStoreManager.getPasswordPolicyId(processId), supportHistoryPolicy);
        else if (supportHistoryPolicy && !this.pwdCredStore.getEnforceHistoryPolicy()) {
            policySuggestion = gs.getMessage('Select Enforce history policy and Enable password policy on the credential store.');
        } else {
            policySuggestion = gs.getMessage('Select Enable password policy on the credential store.');
        }

        var configurationScore = historyPolicy + passwordPolicy;
        this.totalScore += configurationScore;

        if (!gs.nil(policySuggestion))
            this.suggestions.push(policySuggestion);
        return configurationScore;
    },

    _normalizeTotalScore: function() {
        this.totalScore *= this.NORMALIZATION_FACTOR;
    },

    _getPolicyStrength: function(policyId, supportHistoryPolicy) {
        var policyStrength = 7;
        var policyGr = new GlideRecord('password_policy');
        if (!policyGr.get(policyId))
            return;

        //If password policy is high then keep higher score
        if (policyGr.getValue('password_strength') == '30')
            policyStrength = 10;

        //If history policy is not supported then add 3 points
        policyStrength = supportHistoryPolicy ? policyStrength : policyStrength + 3;

        var isDisallowUserDataEnabled = policyGr.getValue('disallow_user_data') == 1;
        var isRepetitionThresholdEnabled = policyGr.getValue('repetition_length_threshold') != 0;
        var isSeqThresholdEnabled = policyGr.getValue('seq_length_threshold') != 0;

        //if history policy is supported then disallow user data has 3 score other 5
        if (isDisallowUserDataEnabled) {
            if (supportHistoryPolicy)
                policyStrength += 3;
            else
                policyStrength += 5;
        }

        if (isRepetitionThresholdEnabled)
            policyStrength++;

        if (isSeqThresholdEnabled)
            policyStrength++;

        if (!(isDisallowUserDataEnabled && isRepetitionThresholdEnabled && isSeqThresholdEnabled))
            this.suggestions.push(gs.getMessage('To improve the password strength, select Disallow User Data, Sequence Length Threshold, and Repetition Length Threshold at the password policy level.'));
        return policyStrength;
    },

    type: 'PwdProcessStrengthCalculatorUtilSNC'
};
