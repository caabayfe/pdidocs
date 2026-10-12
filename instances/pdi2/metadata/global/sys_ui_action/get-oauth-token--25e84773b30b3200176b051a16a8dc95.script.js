function fetchCapableMidServer() {
    var oauthConsumerSupport = new GlideAjax('OAuthConsumerSupport');
	oauthConsumerSupport.addParam('sysparm_name', 'getCapableMidServer');
	oauthConsumerSupport.addParam('applies_to', g_form.getValue("applies_to"));
	oauthConsumerSupport.addParam('specific_mid_list', g_form.getValue('mid_list'));
	oauthConsumerSupport.getXMLWait();
	return oauthConsumerSupport.getAnswer();
}


function getOAuthTokenFromServiceProvider() {
    // Clear status messages
    g_form.clearMessages();

    if (g_form.getValue('use_high_security') == 'true') {
        g_form.addErrorMessage("You can't request an OAuth token from the instance when the External credential store option is selected. The configured MID Server obtains the token when needed.");
        return;
    }

    var oauthRequestorSysId = g_form.getUniqueValue();
    var oauthProfileId = g_form.getValue('oauth_entity_profile');
    var grantType = g_scratchpad.grant_type;
    var oauthRequestorContext = 'oauth_2_0_credentials';
    var integrationType = g_scratchpad.integration_type;
	var useMid = g_scratchpad.use_mid;

    var oauth_initiator_url = '';
    if (grantType === 'password') {
        oauth_initiator_url = '/oauth_password_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

		if (useMid == 'true') {
            var capableMid = fetchCapableMidServer();
            if (capableMid == null || capableMid == "") {
                g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                return;
            } else
                oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
		}

        if (integrationType === 'personal') {
            oauth_initiator_url = oauth_initiator_url + '&sysparm_oauth_personal=true';
        }

    } else if (grantType === 'client_credentials') {
        oauth_initiator_url = '/oauth_client_credentials_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

        if (useMid == 'true') {
            var capableMid = fetchCapableMidServer();
            if (capableMid == null || capableMid == "") {
                g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                return;
            } else
                oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
        }

    } else if (grantType === 'urn:ietf:params:oauth:grant-type:token-exchange') {
        oauth_initiator_url = '/oauth_token_exchange_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

        if (useMid == 'true') {
            var capableMid = fetchCapableMidServer();
            if (capableMid == null || capableMid == "") {
                g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                return;
            } else
                oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
        }

        if (integrationType === 'personal') {
            oauth_initiator_url = oauth_initiator_url + '&sysparm_oauth_personal=true';
        }

    } else if (grantType === 'authorization_code') {
        oauth_initiator_url = '/oauth_initiator.do' +
            '?oauth_requestor_context=' + oauthRequestorContext +
            '&oauth_requestor=' + oauthRequestorSysId +
            '&oauth_provider_profile=' + oauthProfileId +
            '&response_type=code';
		if (useMid == 'true') {
            var capableMid = fetchCapableMidServer();
            if (capableMid == null || capableMid == "") {
                g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                return;
            } else
                oauth_initiator_url += '&use_mid=true&mid_server=' + capableMid;
		}
        if (integrationType === 'personal') {
            oauth_initiator_url = oauth_initiator_url + '&personal=true';
        }

    } else if (grantType === 'urn:ietf:params:oauth:grant-type:jwt-bearer') { // To Handle JWT Bearer Grant Type
        oauth_initiator_url = '/oauth_jwt_bearer_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;
        if (useMid == 'true') {
            var capableMid = fetchCapableMidServer();
            if (capableMid == null || capableMid == "") {
                g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                return;
            } else
                oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
        }

    } else if (grantType === 'urn:ietf:params:oauth:grant-type:saml2-bearer') {
        oauth_initiator_url = '/oauth_saml2_bearer_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

		if (useMid == 'true') {
            capableMid = fetchCapableMidServer();
            if (capableMid == null || capableMid == "") {
                g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                return;
            } else
                oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
		}
    } else {
        g_form.addErrorMessage('Unsupported OAuth grant type \'' + grantType + '\'.');
        return;
    }
	

    window.open(oauth_initiator_url, '', 'height=500,width=800'); // pops up window
    return;
}

function parseAjaxResponse(response) {
    // Do nothing as client script is performing the validation of the token.
}
