var GliderGitCredentialsUtil = Class.create();
GliderGitCredentialsUtil.prototype = {
    initialize: function() {},

    /**
     * Gets IDE Git credentials for current user
     * @param remoteResource String
     * @returns ideGitCredentialSysId
     */
    getIdeGitCredential: function(remoteResource, userId) {
        if (!remoteResource)
            return null;

        var glideUserId = userId || gs.getUserID();

        var ideGitCredential = new GlideRecord('sn_glider_ide_git_credential');
        ideGitCredential.addQuery('user', glideUserId);
        ideGitCredential.addQuery('active', true);
        ideGitCredential.orderBy('remote_resource');
        ideGitCredential.query();
        const repoSources = [];
        while (ideGitCredential.next()) {
            repoSources.push({
                remote_resource: ideGitCredential.getValue('remote_resource'),
                sys_id: ideGitCredential.getUniqueValue()
            });
        }

        const closestMatch = this.getClosestRepoMatch(remoteResource, repoSources);

        return closestMatch ? closestMatch : null;
    },


    /**
     * Gets the closest match for a given remote resource from a list of active repo sources stored in sn_glider_ide_git_credential table.
     * Score is calculated by sum of weighted average where more weight is given to a path that is in the start of the URL
     * For example, if the remote resource is https://github.com/myorg/myrepo, the scores will be as follows:
        https://github.com              => (3 + 0 + 0) / 3 = 1
        https://github.com/myorg        => (3 + 2 + 0) / 3 = 1.67
        https://github.com/myorg/myrepo => (3 + 2 + 1) / 3 = 2
        https://gitlab.com              => (0 + 0 + 0) / 3 = 0
     * This makes the matching agnostic to the URL formats from different providers
     * @param remoteResource String
     * @param repoSources Array
     * @returns {{sys_id: string, score: number} | null}
     */
    getClosestRepoMatch: function(remoteResource, repoSources = []) {
        // Quit early if the list is empty
        if (repoSources.length === 0) return;

        // If we find an exact match, quit early.
        const exactMatch = repoSources.find(repo => repo.remote_resource === remoteResource);
        if (exactMatch) {
            return {
                sys_id: exactMatch.sys_id,
                score: this.getMaxScore(remoteResource)
            };
        }

        const remotePaths = this._sliceUrl(remoteResource);
        if (!remotePaths || remotePaths.length === 0) {
            // If we can't parse the target remote resource, no point in continuing, hopefully there was an exact match above
            gs.error(`Could not parse remote resource URL: ${remoteResource}`);
            return;
        }

        let currentBestMatch = {
            score: 0
        };

        for (const repo of repoSources) {
            const sourcePaths = this._sliceUrl(repo.remote_resource);
            if (!sourcePaths || sourcePaths.length === 0) continue;

            let score = 0;
            // We compare the paths of the remote resource and the source resource URLs
            for (let index = 0; index < remotePaths.length && index < sourcePaths.length; index++) {
                let remotePath = remotePaths[index];
                let sourcePath = sourcePaths[index];
                if (remotePath !== sourcePath) {
                    break;
                }
                score += (remotePaths.length - index);
            }
            score = score / remotePaths.length;

            if (score > currentBestMatch.score) {
                currentBestMatch = {
                    remote_resource: repo.remote_resource,
                    sys_id: repo.sys_id,
                    score
                };
            }
        }
        // If we found a good enough match
        if (currentBestMatch.sys_id) {
            return {
                sys_id: currentBestMatch.sys_id,
                score: currentBestMatch.score
            };
        }
    },

    /**
     * Calculates the maximum score for a given remote resource. As we use sum of weighted average to calculate the score, 
     * the maximum score is the number of segments in the URL divided by 2.
     * @param remoteResource String
     * @returns maxScore Number
     */
    getMaxScore(remoteResource) {
        var paths = this._sliceUrl(remoteResource);

        return (paths.length + 1) / 2;
    },

    /**
     * Slices the URL into segments. The segments are sorted in the order they appear in the URL.
     * @param remoteResource String
     * @returns pathSegments Array
     */
    _sliceUrl(remoteResource) {
        // Remove the protocol part of the URL
        const path = remoteResource.replace(/^https?:\/\//, '');

        // Remove leading/trailing slashes
        const cleanedPath = path.replace(/^\/|\/$/g, '');

        // Split the path into segments
        const pathSegments = cleanedPath.split('/');

        return pathSegments;
    },

    /**
     * Gets Domain name from a URL
     * @param repoUrl String
     * @returns providerDomainName String
     */
    getProviderName: function(repoUrl) {
        var matchedParts = repoUrl.match(/\/\/([^/]+)\//);

        return matchedParts ? matchedParts[1] : '';
    },

    /**
     * Gets Git credentials (username and token)
     * Also returns authorizationUrl if ideGitCredentialSysId belongs to oauth_2_0_credentials
     * @param ideGitCredentialSysId String
     * @returns {{gitUserName: string, token: string} | {gitUserName: string, token: string, authorizationUrl: string} | null} - The Git credentials or null if not found.
     */
    getGitCredentials: function(ideGitCredentialSysId) {
        var ideGitCredentialGr = new GlideRecord('sn_glider_ide_git_credential');
        if (!ideGitCredentialGr.get(ideGitCredentialSysId))
            return null;

        if (ideGitCredentialGr.auth_credential_table == 'basic_auth_credentials') {
            return this.getBasicAuthCredentials(ideGitCredentialGr.auth_credential);
        } else if (ideGitCredentialGr.auth_credential_table == 'oauth_2_0_credentials') {
            return this.getOAuthCredentials(ideGitCredentialGr.auth_credential_oauth);
        }

        gs.error('[IDE] Auth credential table {0} is not supported', ideGitCredentialGr.auth_credential_table);
        return null;
    },

    /**
     * Gets Basic auth credentials (username and password)
     * @param basicAuthCredentialSysId String
     * @returns {gitUserName, token}
     */
    getBasicAuthCredentials: function(basicAuthCredentialSysId) {
        try {
            var provider = new sn_cc.StandardCredentialsProvider();
            var credential = provider.getCredentialByID(basicAuthCredentialSysId);
            if (!credential)
                return null;

            var userName = credential.getAttribute('user_name');
            var password = credential.getAttribute('password');

            if (this._isPasswordInPlainText(basicAuthCredentialSysId, password)) {
                throw new Error('Password not encrypted.')
            }

            return {
                gitUserName: userName,
                token: password
            };
        } catch (error) {
            // Captures errors from CredentialsProvider as well as ones due to use of plain text.
            gs.error('[IDE] Invalid basic auth credentials.', error);
            this._deleteBasicAuthCredentialIfExists(basicAuthCredentialSysId);
            return null;
        }
    },

    /**
     * Gets OAuth credentials (username and password) and authorizationUrl
     * Use authorizationUrl to authorize user and get oauth tokens if credentials didn't work
     * @param oAuthCredentialSysId String
     * @returns {gitUserName, token, authorizationUrl}
     */
    getOAuthCredentials: function(oAuthCredentialSysId) {
        var oAuthProfileId = this._getOAuthProfileId(oAuthCredentialSysId);
        if (!oAuthProfileId)
            return null;

        var oAuthRequestorId = oAuthCredentialSysId;

        var provider = new sn_cc.StandardCredentialsProvider();
        var credential = provider.getCredentialByID(oAuthCredentialSysId);
        if (!credential)
            return null;

        var authorizationUrl = this._getOAuthInitiatorUrl(oAuthRequestorId, oAuthProfileId);;
        var userName = credential.getAttribute('user_name');
        var password = this._getAccessToken(oAuthRequestorId, oAuthProfileId);

        return {
            gitUserName: userName,
            token: password,
            authorizationUrl: authorizationUrl
        };
    },

    /**
     * Gets oauth profile ID for an oauth_2_0_credentials record
     * @param oAuthCredentialSysId String
     * @returns profileId String
     */
    _getOAuthProfileId: function(oAuthCredentialSysId) {
        if (!oAuthCredentialSysId) {
            gs.warn('[IDE] oAuthCredentialId is required to get profile ID');
            return null;
        }
        var gr = new GlideRecord('oauth_2_0_credentials');
        if (!gr.get(oAuthCredentialSysId)) {
            gs.warn('[IDE] OAuth Credential does not exist. ID: ' + oAuthCredentialSysId);
            return null;
        }

        return gr.oauth_entity_profile;
    },

    /**
     * Generates oauth initiator URL
     * @param oAuthRequestorId String
     * @param oauthProfileId String
     * @returns requestor_id String
     */
    _getOAuthInitiatorUrl: function(oAuthRequestorId, oauthProfileId) {
        var oauthRequestorContext = 'oauth_2_0_credentials';
        var params = {
            oauth_requestor_context: oauthRequestorContext,
            oauth_requestor: oAuthRequestorId,
            oauth_provider_profile: oauthProfileId,
            response_type: 'code',
            personal: true,
            scope: 'repo'
        };

        var url = '/oauth_initiator.do?' + Object.keys(params).map(function(key) {
            return key + '=' + encodeURIComponent(params[key]);
        }).join('&');

        return url;
    },

    /**
     * Gets an oauth access token for provided oauth profile. 
     * If access token is expired and refresh token is available, it will generate new access token (refresh token also may get replaced based on oauth provider's refresh token rotation policy)
     * If access token is expired and refresh token is not available, it will return empty string.
     * @param oAuthRequestorId String
     * @param oAuthProfileId String
     * @returns token String
     */
    _getAccessToken: function(oAuthRequestorId, oAuthProfileId) {
        var bufferTimeBeforeTokenExpires = parseInt(gs.getProperty('sn_glider.oauth.token.expiry.buffer', 30)); // 30 seconds

        var oAuthClient = new sn_auth.GlideOAuthClient();
        oAuthClient.setPersonal(true); // setPersonal to true will return tokens for logged in user
        var token = oAuthClient.getToken(oAuthRequestorId, oAuthProfileId);

        if (token && token.getExpiresIn() >= bufferTimeBeforeTokenExpires) {
            // If access token exists and is not expired, use it			
            return token.getAccessToken();
        } else if (token && token.getRefreshToken() && token.getRefreshTokenExpiresIn() >= bufferTimeBeforeTokenExpires) {
            // If refresh token exists and is not expired, use it to generate new access token
            var newToken = this._getNewAccessToken(oAuthRequestorId, oAuthProfileId, token.getRefreshToken());
            if (newToken)
                return newToken.getAccessToken();
        }

        return '';
    },


    /**
     * Generates and saves new access token and refresh token.
     * @param oAuthRequestorId String
     * @param oAuthProfileId String
     * @param refreshToken String
     * @returns {token}
     */
    _getNewAccessToken: function(oAuthRequestorId, oAuthProfileId, refreshToken) {
        if (!(refreshToken && oAuthRequestorId && oAuthProfileId))
            return;

        var tokenRequest = new sn_auth.GlideOAuthClientRequest();

        tokenRequest.setGrantType('refresh_token');
        tokenRequest.setRefreshToken(refreshToken);
        tokenRequest.setParameter('oauth_requestor_context', 'oauth_2_0_credentials');
        tokenRequest.setParameter('oauth_requestor', oAuthRequestorId);
        tokenRequest.setParameter('oauth_provider_profile', oAuthProfileId);
        var oAuthClient = new sn_auth.GlideOAuthClient();
        oAuthClient.setPersonal(true);
        var tokenResponse = oAuthClient.requestTokenByRequest(null, tokenRequest);
        var error = tokenResponse.getErrorMessage();
        if (error) {
            gs.error('[IDE] Error:' + tokenResponse.getErrorMessage());
            return;
        }

        return tokenResponse.getToken();
    },

    /**
     * Deletes Basic auth credentials if it exists
     * @param basicAuthCredentialSysId String
     * @returns void
     */
    _deleteBasicAuthCredentialIfExists: function(basicAuthCredentialSysId) {
        var gr = new GlideRecord("basic_auth_credentials");
        if (basicAuthCredentialSysId && gr.get(basicAuthCredentialSysId)) {
            gs.info('[IDE] Deleting basic auth credential ' + basicAuthCredentialSysId);
            gr.deleteRecord();
        }
    },

    /**
     * Compares basic auth password value with its decrypted value
     * @param basicAuthCredentialSysId String
     * @param decryptedValue String
     * @returns boolean
     */
    _isPasswordInPlainText: function(basicAuthCredentialSysId, decryptedValue) {
        var gr = new GlideRecord('basic_auth_credentials');
        if (basicAuthCredentialSysId && gr.get(basicAuthCredentialSysId)) {
            return gr.password == decryptedValue;
        }
        return false;
    },

    type: 'GliderGitCredentialsUtil'
};
