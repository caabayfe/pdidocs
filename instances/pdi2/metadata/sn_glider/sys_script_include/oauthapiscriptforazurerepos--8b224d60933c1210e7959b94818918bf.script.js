var OauthAPIScriptForAzureRepos = Class.create();
OauthAPIScriptForAzureRepos.prototype = {
    initialize: function(oauthContext) {
        this.oauthContext = oauthContext;
    },

    interceptRequestParameters: function(requestParamMap) {
        this.preprocessAccessToken(requestParamMap);
    },

    parseTokenResponse: function(accessTokenResponse) {
        this.postprocessAccessToken(accessTokenResponse);
    },

    preprocessAuthCode: function(requestParamMap) {
        /** 
         * Add all authorized scopes of your azure oauth app.
         * For example, if your app has scopes vso.code_full and vso.code_status, set scopes like this
         * var scopes = 'vso.code_full vso.code_status';
         */
        var scopes = 'vso.code_full';
        requestParamMap.put('scope', scopes);
        requestParamMap.put('response_type', 'Assertion');
    },

    preprocessAccessToken: function(requestParamMap) {
        /**
         * The client secret is from oauth_entity.client_secret (in Application registry record)
         * Azure OAuth app client secrets may exceed the default 255-character limit.
         * Increase the maximum length of oauth_entity.client_secret to fit, e.g., set it to 2048.
         */
        var clientSecret = requestParamMap.get('client_secret');
        var grantType = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
        var clientAssertionType = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
        var authCode = requestParamMap.get('code');

        requestParamMap.remove('client_secret');
        requestParamMap.remove('code');
        requestParamMap.remove('grant_type');

        requestParamMap.put('client_assertion', clientSecret);
        requestParamMap.put('client_assertion_type', clientAssertionType);
        requestParamMap.put('grant_type', grantType);
        requestParamMap.put('assertion', authCode);
    },

    postprocessAccessToken: function(accessTokenResponse) {
        var paramMap = accessTokenResponse.getparameters();
        if (!paramMap) {
            gs.error('GitOAuth2 - no parameters found in the response');
            return;
        }
        var accessTokenResponseBody = accessTokenResponse.getBody();
        if (!accessTokenResponseBody) {
            gs.error('GitOAuth2 - no response body found in the response');
            return;
        }
        var tokenResponse = (new global.JSON()).decode(accessTokenResponseBody);
        for (param in tokenResponse)
            paramMap.put(param, tokenResponse[param].toString());
    },

    type: 'OauthAPIScriptForAzureRepos'
};
