function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord()) {
        g_form.setValue('active', false);
        g_form.setReadOnly('active', true);
        return;
    }
    g_form.setReadOnly('channel', true);
    g_form.setReadOnly('policy_type', true);
    validatePolicy();
    showRelatedList();
}

function showRelatedList() {
    var isAnonymization = g_form.getValue('policy_type') === 'anonymization';
    const REL_ANONYMIZATION = 'REL:b4e167fd437302102f66d069a7b8f2a6';
    const REL_DISCOVERY = 'REL:34539589ff2032105584ffffffffff2f';
    if (isAnonymization) {
        g_form.hideRelatedList(REL_DISCOVERY);
        g_form.showRelatedList(REL_ANONYMIZATION);
    } else {
        g_form.hideRelatedList(REL_ANONYMIZATION);
        g_form.showRelatedList(REL_DISCOVERY);
    }
    validatePolicy();
}


function validatePolicy() {
    var ga = new GlideAjax('global.PrivacyCoreValidator');
    ga.addParam('sysparm_name', 'validatePolicy');
    ga.addParam('sysparm_policyId', g_form.getUniqueValue());
    ga.addParam('sysparm_config_table', g_form.getTableName());
    ga.getXMLWait();
    var validationResponse = processAnswer(ga.getAnswer());
	var policyInDomain = isPolicyInDomain();

    // make policy inactive only if policy is in current domain and validation fails
    if (policyInDomain && validationResponse.errors.length > 0) {
        var errorText = getMessage("This policy is inactive because of the following reasons:");
        validationResponse.errors.unshift(errorText);
        g_form.setValue('active', false);
        g_form.setReadOnly('active', true);
        changePolicyActive('false');
    } else {
        g_form.setReadOnly('active', false);
    }

	canActivatePolicy();
    // alert users about validation
    addUserMessages(validationResponse, policyInDomain);
    return validationResponse.errors.length == 0;
}

function isPolicyInDomain() {
	ga = new GlideAjax('global.PrivacyCoreValidator');
    ga.addParam('sysparm_name', 'isPolicyInDomain');
    ga.addParam('sysparm_policyId', g_form.getUniqueValue());
    ga.addParam('sysparm_config_table', g_form.getTableName());
    ga.getXMLWait();
	return ga.getAnswer() == 'true';
}

function canActivatePolicy() {	
	var gwt = new GwtMessage();
	// based on number of active policies for given channel, decide.
	ga = new GlideAjax('global.PrivacyCoreValidator');
	ga.addParam('sysparm_name', 'getNumActivePolicies');
	ga.addParam('sysparm_policyId', g_form.getUniqueValue());
	ga.addParam('sysparm_channel_sysid', g_form.getValue('channel'));
	ga.addParam('sysparm_policy_type', g_form.getValue('policy_type'));
	ga.getXMLWait();
	var numActivePolicies = parseInt(ga.getAnswer());
	if (numActivePolicies > 0) {
		var warningMessage = gwt.getMessage("One or more active privacy configurations for policy type {0} and data channel {1} exist.",
			g_form.getValue('policy_type'), g_form.getDisplayBox('channel').value);
		g_form.addInfoMessage(warningMessage);
		changePolicyActive('false');
		g_form.setValue('active', false);

		// make active flag read only if current record is not already active. This will ensure users can deactivate this policy. 
		g_form.setReadOnly('active', true);
	}
}

function processAnswer(validationResponseStr) {
    var errorMsgs = [];
    var warningMsgs = [];
    if (!validationResponseStr) {
        return {
            'errors': errorMsgs,
            'warnings': warningMsgs
        };
    }
    var validationResponse = JSON.parse(validationResponseStr);
    var responseElement = validationResponse.sdhChannelPolicyValidationResponse;
    getResponseMessages(responseElement, errorMsgs, warningMsgs);

    return {
        'errors': errorMsgs,
        'warnings': warningMsgs
    };
}

function addUserMessages(validationResponse, showErrors) {
    var messages = '';
    for (i = 0; i < validationResponse.warnings.length; i++) {
        if (messages.length == 0)
            messages += '<html>';
        messages += validationResponse.warnings[i];
        messages += '<br>';
    }
    if (messages.length > 0) {
        messages += '</html>';
        g_form.addInfoMessage(messages);
    }

	if (!showErrors)
		return;

    messages = '';
    for (i = 0; i < validationResponse.errors.length; i++) {
        if (messages.length > 0)
            messages += '<br>';
        messages += validationResponse.errors[i];
    }
    if (messages.length > 0)
        g_form.addErrorMessage(messages);
}

function changePolicyActive(active) {
    var ga = new GlideAjax('global.PrivacyCoreValidator');
    ga.addParam('sysparm_name', 'setPolicyActive');
    ga.addParam('sysparm_dp_policyID', g_form.getUniqueValue());
    ga.addParam('sysparm_config_table', g_form.getTableName());
    ga.addParam('sysparm_active', active);
    ga.getXMLWait();
}

/**
 * Process a responseElement, an array one or more sub-elements.
 * This method extracts the messageType and messageText from the sub-elements
 */
function getResponseMessages(responseElem, errorMsgs, warningMsgs) {
    if (!responseElem)
        return;
		
    for (i = 0; i < responseElem.length; i++) {
        var messageType = responseElem[i].messageType;
        var messageText = responseElem[i].messageText;
        if (messageType == 'error')
            errorMsgs.push(messageText);
        else
            warningMsgs.push(messageText);
    }
}
