function fetchCapableMidServer(midName) {
	var oauthConsumerSupport = new GlideAjax('OAuthConsumerSupport');
    oauthConsumerSupport.addParam('sysparm_name', 'getCapableMidServer');
    oauthConsumerSupport.addParam('applies_to', 'specific');
    oauthConsumerSupport.addParam('specific_mid_list', midName);
    oauthConsumerSupport.getXMLWait();
    return oauthConsumerSupport.getAnswer();
}

/**
 * Returns MID Server name based on: use_mid_server, use_auth_mid_server, and auth_via_mid_property
 * Returns null if MID Server is not used to fetch token (use instance instead)
 */
function determineMIDServerForAuth() {
	var resource_mid_server = g_form.getValue('use_mid_server');
	var auth_mid_server = g_form.getValue('use_auth_mid_server');
	var use_same_mid_for_auth_property = g_scratchpad.use_same_mid_for_auth == 'true';	// Default false

	if (auth_mid_server) {
		return auth_mid_server;
	}

	if (use_same_mid_for_auth_property && resource_mid_server) {
		return resource_mid_server;
	}

	return null;
}

function getOAuthTokenFromServiceProvider() {
    g_form.clearMessages();

    var useParentAuth = g_form.getValue('authentication_type') == 'inherit_from_parent';

    if (useParentAuth) {
		buildAndOpenOAuthUrl(
            g_scratchpad.rm_sys_id,
            g_scratchpad.rm_oauth2_profile,
            g_scratchpad.rm_grant_type,
            'sys_rest_message'
        );
    } else {
        buildAndOpenOAuthUrl(
            g_form.getUniqueValue(),
            g_form.getValue('oauth2_profile'),
            g_scratchpad.grant_type,
            'sys_rest_message_fn'
        );
    }
}

function buildAndOpenOAuthUrl(oauthRequestorSysId, oauthProfileId, grantType, oauthRequestorContext) {
    var oauth_initiator_url = '';
    if (grantType === 'password') {
        oauth_initiator_url = '/oauth_password_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

    } else if (grantType === 'client_credentials') {
        oauth_initiator_url = '/oauth_client_credentials_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

    } else if (grantType === 'urn:ietf:params:oauth:grant-type:token-exchange') {
		oauth_initiator_url = '/oauth_token_exchange_input.do' +
		'?sysparm_oauth_requestor_context=' + oauthRequestorContext +
		'&sysparm_oauth_requestor=' + oauthRequestorSysId +
		'&sysparm_oauth_provider_profile=' + oauthProfileId;
		
	} else if (grantType === 'authorization_code') {
        oauth_initiator_url = '/oauth_initiator.do' +
            '?oauth_requestor_context=' + oauthRequestorContext +
            '&oauth_requestor=' + oauthRequestorSysId +
            '&oauth_provider_profile=' + oauthProfileId +
            '&response_type=code';

    } else if (grantType === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
        oauth_initiator_url = '/oauth_jwt_bearer_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

    } else if (grantType === 'urn:ietf:params:oauth:grant-type:saml2-bearer') {
        oauth_initiator_url = '/oauth_saml2_bearer_input.do' +
            '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
            '&sysparm_oauth_requestor=' + oauthRequestorSysId +
            '&sysparm_oauth_provider_profile=' + oauthProfileId;

    } else {
        g_form.addErrorMessage('Unsupported OAuth grant type \'' + grantType + '\'.');
        return;
    }

    // Handle use MID Server for token retrieval
	var midName = determineMIDServerForAuth();
	if (midName) {
		var capableMid = fetchCapableMidServer(midName);
        if (!capableMid) {
            g_form.addErrorMessage(getMessage('No valid mid server with REST capability available.'));
            return;
        }
        var paramPrefix = (grantType !== 'authorization_code') ? 'sysparm_' : '';
        oauth_initiator_url += '&' + paramPrefix + 'use_mid=true&' + paramPrefix + 'mid_server=' + capableMid;
	}

    window.open(oauth_initiator_url, '', 'height=500,width=800'); // pops up window
    return;
}
