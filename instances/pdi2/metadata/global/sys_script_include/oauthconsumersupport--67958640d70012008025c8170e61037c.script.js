var OAuthConsumerSupport = Class.create();
OAuthConsumerSupport.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initiateCCTokenFlow: function() {

        // Create an output tag called result
        var result = this.newItem('result');

        // Get from the parameters
        var requestor = this.getParameter('oauth_requestor');
        var personal = this.getParameter('oauth_personal');
        var requestor_context = this.getParameter('oauth_requestor_context');
        var oauth_provider_profile = this.getParameter('oauth_provider_profile');
        var oauth_provider_id = this.getParameter('oauth_provider_id');
        var mid_server = this.getParameter('mid_server');

        //request for a token using CC flow
        var tokenRequest = new sn_auth.GlideOAuthClientRequest();
        tokenRequest.setParameter('oauth_requestor_context', requestor_context);
        tokenRequest.setParameter('oauth_requestor', requestor);
        tokenRequest.setParameter('personal', personal);
        tokenRequest.setParameter('oauth_provider_profile', oauth_provider_profile);
        tokenRequest.setParameter('oauth_provider_id', oauth_provider_id);
        if (this.getParameter('use_mid'))
            tokenRequest.setMIDServer(mid_server);


        var oAuthClient = new sn_auth.GlideOAuthClient();
        var tokenResponse = oAuthClient.requestTokenByRequest(null, tokenRequest);
        var statusCode = tokenResponse.getResponseCode();
        var errorMsg = tokenResponse.getErrorMessage();
        result.setAttribute('responseCode', statusCode);
        result.setAttribute('errorMessage', errorMsg);
        var flowName = 'client_credentials';

        if (!this.isSuccessStatus(statusCode) || errorMsg ) {
            gs.log('OAuth authentication failed for ' + flowName + ' grant type flow');
            result.setAttribute('isToken', 'false');
            return;
        }

        if (tokenResponse) {
            var token = tokenResponse.getToken();

            if (token) {
                if (token.getAccessToken()) {
                    gs.log("Successfully obtained OAuth token");
                    result.setAttribute('isToken', 'true');
                    return;
                }
            }
        }

        gs.log('OAuth authentication failed for ' + flowName + ' grant type flow');
        result.setAttribute('isToken', 'false');

    },

    getCapableMidServer: function() {
        return new sn_auth.OAuthMidSelector().selectRESTCapableMidServer(this.getParameter('applies_to'), this.getParameter('specific_mid_list'));
    },

    isOAuthViaMidActive: function() {
	return GlidePluginManager.isActive('com.snc.mid.enhanced_security.oauth');
    },

	isSuccessStatus: function(code) {
	  return code >= 200 && code < 300;
    },

    type: 'OAuthConsumerSupport'
});
