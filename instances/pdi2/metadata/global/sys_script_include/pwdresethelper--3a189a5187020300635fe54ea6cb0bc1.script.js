var PwdResetHelper = Class.create();

// @return {boolean} specifying if the new password is strong or not
PwdResetHelper.validateNewPasswordComplexity = function(processId, newPasswd) {
    var credMgr = new SNC.PwdCredentialStoreManager();
    var credId = credMgr.getCredentialStoreIdByProcessId(processId);

    var credGr = new GlideRecord('pwd_cred_store');
    if (credGr.get(credId)) {
        var pwdRule = credGr.getValue('pwd_rule');
        var pwdRuleCall = pwdRule + '\nisPasswordValid(password);';
        credGr.setValue('pwd_rule', pwdRuleCall);
        var vars = {
            'password': newPasswd
        };

        var evaluator = new GlideScopedEvaluator();
        var pwdValid = evaluator.evaluateScript(credGr, 'pwd_rule', vars);
        if (pwdValid) {
            return true;
        }
    }
    return false;
};

/**
	Execute the post processor script include
	@param {String} requestId
	@param {String} processId
	@param {boolean} wfSuccess
	@return {"status":, "message":, "value":}
*/
PwdResetHelper.executePostProcessorScript = function(requestId, processId, wfSuccess) {

    if (gs.nil(processId) || gs.nil(requestId))
        return {
            status: 'failure',
            message: 'Either process id or request id is null',
            value: ''
        };

    // If wfSuccess is null, we will consider it as false
    wfSuccess = !gs.nil(wfSuccess);

    var LOG_ID = "[PwdAjaxWFRequestProcessor:runPostProcessor] ";
    var trackingMgr = new SNC.PwdTrackingManager();

    var gr = new GlideRecord('pwd_process');
    if (!gr.get(processId)) {
        var errorMsg = "Cannot load the process: " + processId;
        trackingMgr.createActivity(PwdConstants.TYPE_WARNING, PwdConstants.STAGE_RESET, errorMsg, requestId);
        var responseErrorMsg = gs.getMessage("{0} Cannot load the process: {1}", [LOG_ID, processId]);
        return {
            status: 'failure',
            message: responseErrorMsg,
            value: ''
        };
    }

    if (!gs.nil(gr.post_processor)) {
        var postProcessorId = gr.post_processor;
        var postProcessorName = gr.post_processor.name;

        try {
            // Invoke the post process script include selected on the process    
            // published interface for the password_reset.extension.post_rest_script extensions (see pwd_extension_type) is:
            //
            // @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
            // @param params.wfSuccess      A flag indicating if workflow completed sucessfully. True if (and only if) sucessful.
            // @return no return value
            var params = new SNC.PwdExtensionScriptParameter();
            params.resetRequestId = requestId;
            params.wfSuccess = wfSuccess;
            var postResetExtension = new SNC.PwdExtensionScript(postProcessorId);

            var infoMsg = "Starting post-processor script: " + postProcessorName;
            trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, infoMsg, requestId);
            postResetExtension.process(params);
        } catch (error) {
            var exceptionMsg = gs.getMessage("Error while executing post-processor script: {0}. Error:{1}", [postProcessorName, error]);
            trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, exceptionMsg, requestId);
            var responseExceptionMsg = gs.getMessage("{0} Error while executing post-processor script {1}. Error: {2}",
                [LOG_ID, postProcessorName, error]);
            return {
                status: 'failure',
                message: responseExceptionMsg,
                value: ''
            };
        }

        var successMsg = gs.getMessage("Completed post-processor script: {0}", postProcessorName);
        trackingMgr.createActivity(PwdConstants.TYPE_INFO, PwdConstants.STAGE_RESET, successMsg, requestId);
        var responseSuccessMsg = gs.getMessage("{0} Completed post-processor script: {1}", [LOG_ID, postProcessorName]);
        return {
            status: 'success',
            message: responseSuccessMsg,
            value: ''
        };
    }
};
//Check if midserver is running.
PwdResetHelper.IsMidRunning = function(procId) {

    // Check if midserver is runnign if process uses Active directory
    var procGr = new GlideRecord('pwd_process');
    procGr.get(procId);
    var credStoreId = procGr.getValue('cred_store');
    var pwdCredStor = new GlideRecord('pwd_cred_store');
    pwdCredStor.get(credStoreId);
    var credStoreType = pwdCredStor.getValue('type');

    //Active Directory credential store type.
    var pwdCredStoreType = '94d5b6debf440100710071a7bf0739d9';
    var midServerRunning = true;

    if (credStoreType == pwdCredStoreType) {
        midServerRunning = false;
        var eccAgent = new GlideRecord('ecc_agent');
        eccAgent.query();
        while (eccAgent.next()) {
            var agentId = eccAgent.getUniqueValue();
            var agentCapability = new GlideRecord('ecc_agent_capability_m2m');
            agentCapability.addQuery('agent', agentId);
            var reqCapabilities = agentCapability.addQuery('capability', '427709a60a0006bc7d2904e99132532d');
            reqCapabilities.addOrCondition('capability', 'eeab973fd7802200bdbaee5b5e610381');
            agentCapability.query();
            if (agentCapability.hasNext()) {
                var midServerStatus = eccAgent.getValue('status');
                var midServervalidated = eccAgent.getValue('validated');
                if ((midServerStatus == 'Up') && (midServervalidated == 'true')) {
                    midServerRunning = true;
                    break;
                }
            }
        }
    }
    return midServerRunning;
};

//check if the cred store type record has test connection subflow mapping
PwdResetHelper.connectionSubflowMapped = function(credStoreTypeSysId) {
    var gr = new GlideRecord("pwd_cred_store_type");
    gr.get(credStoreTypeSysId);

    return (!gr.use_flow || (gr.use_flow && !gs.nil(gr.conn_test_flow)));
};

/**
	Restricts a caller-supplied post-reset redirect URL to either the host the
	process admin already configured on pwd_process.redirect_url, or a host
	listed in the password_reset.redirect.allowed_domains system property, so
	an anonymous request parameter cannot redirect to an arbitrary
	attacker-controlled host while still allowing processes that are
	intentionally configured to send users to an external site after a reset.
	Relative URLs are always allowed, since they cannot leave the instance.
	@param {String} candidateUrl - redirect URL requested by the caller (already run through GlideSecurityUtils.cleanURL())
	@param {String} processId - sys_id of the pwd_process record driving this reset
	@return {String} candidateUrl if it is relative or its host is allowed, otherwise ''
*/
PwdResetHelper.getAllowedRedirectUrl = function(candidateUrl, processId) {
    if (gs.nil(candidateUrl))
        return candidateUrl;

    if (!PwdResetHelper._isAbsoluteUrl(candidateUrl))
        return candidateUrl;

    var candidateHost = PwdResetHelper._getUrlHost(candidateUrl);

    var procGr = new GlideRecord('pwd_process');
    var configuredHost = (procGr.get(processId) && !gs.nil(procGr.getValue('redirect_url'))) ?
        PwdResetHelper._getUrlHost(procGr.getValue('redirect_url')) : '';

    if (configuredHost && configuredHost == candidateHost)
        return candidateUrl;

    if (PwdResetHelper._isHostInAllowedList(candidateHost))
        return candidateUrl;

    gs.warn('[PwdResetHelper:getAllowedRedirectUrl] Rejected redirect URL not matching the process-configured host or the ' +
        'password_reset.redirect.allowed_domains list: ' + candidateUrl);
    return '';
};

PwdResetHelper._isHostInAllowedList = function(candidateHost) {
    if (!candidateHost)
        return false;

    var allowedList = gs.getProperty('password_reset.redirect.allowed_domains', '');
    var entries = allowedList.split(',');
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].trim();
        if (!entry)
            continue;

        var entryHost = PwdResetHelper._isAbsoluteUrl(entry) ? PwdResetHelper._getUrlHost(entry) : entry.toLowerCase();
        if (entryHost == candidateHost)
            return true;
    }
    return false;
};

PwdResetHelper._isAbsoluteUrl = function(text) {
    if (gs.nil(text))
        return false;
    return (/^https?:\/\//i).test(text) || (/^\s*\/\//).test(text);
};

PwdResetHelper._getUrlHost = function(url) {
    var match = /^(?:[a-z][a-z0-9+.-]*:)?\/\/([^\/?#]+)/i.exec(url);
    return match ? match[1].toLowerCase() : '';
};
