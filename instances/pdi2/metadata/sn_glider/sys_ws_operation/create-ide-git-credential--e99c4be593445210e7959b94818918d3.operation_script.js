(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // TODO: Handle error messages, localizations, edge cases, code cleanup
    var requestData = request.body.data;
    var authType = requestData.authType;
    var resourceUrl = requestData.resourceUrl;
    var gitUsername = requestData.gitUsername;
    var newIdeGitCredentialSysId = null;
    var ideGlobalUtils = new global.IDEGlobalUtils();

    if (authType === 'Basic Auth') {
        var personalAccessToken = requestData.personalAccessToken;
        if (!resourceUrl || !gitUsername || !personalAccessToken) {
            response.setStatus(400);
            response.setBody({
                error: sn_i18n.Message.getMessage('glider_ide:git', 'Repository url, Git username and Personal access token are required.')
            });
            return response;
        }

        deactivateExistingCredentialIfAny(resourceUrl);
        var newCredentialName = generateCredentialName('basic');

        try {
            var basicAuthSysId = ideGlobalUtils.createBasicAuthCredential(gitUsername, personalAccessToken, newCredentialName);
            newIdeGitCredentialSysId = createIdeGitCredentialRecord(basicAuthSysId, 'basic_auth_credentials', resourceUrl, newCredentialName);
        } catch (error) {
            gs.error('[IDE] Failed to create basic auth credential.', error);
        }
    } else if (authType === 'OAuth') {
        var oauthEntityProfileSysId = requestData.oauthEntityProfileSysId;
        if (!resourceUrl || !gitUsername || !oauthEntityProfileSysId) {
            response.setStatus(400);
            response.setBody({
                error: sn_i18n.Message.getMessage('glider_ide:git', 'Repository url, Git username and Oauth Entity Profile are required.')
            });
            return response;
        }

        deactivateExistingCredentialIfAny(resourceUrl);
        newCredentialName = generateCredentialName('oauth');
        try {
            var oAuthSysId = ideGlobalUtils.createOAuthCredential(gitUsername, oauthEntityProfileSysId, newCredentialName)
            newIdeGitCredentialSysId = createIdeGitCredentialRecord(oAuthSysId, 'oauth_2_0_credentials', resourceUrl, newCredentialName);
        } catch (error) {
            gs.error('[IDE] Failed to create OAuth credential.', error);
        }
    } else {
        // Send bad request
        response.setStatus(400);
        response.setBody({
            error: sn_i18n.Message.getMessage('glider_ide:git', 'Supported auth types are Basic Auth and OAuth')
        });

        return response;
    }

    if (newIdeGitCredentialSysId !== null) {
        gs.info('[IDE] Created new IDE Git credential sys_id={0}', newIdeGitCredentialSysId);
        response.setStatus(200);
        response.setBody({
            newIdeGitCredentialSysId: newIdeGitCredentialSysId,
            message: sn_i18n.Message.getMessage('glider_ide:git', 'Credential created')
        });
    } else {
        response.setStatus(500);
        response.setBody({
            error: sn_i18n.Message.getMessage('glider_ide:git', 'Unable to create credential')
        });
    }

    function generateCredentialName(prefix) {
        return [prefix, gs.getUserName(), new Date().getTime()].join('_').substring(0, 40);
    }

    function deactivateExistingCredentialIfAny(resourceUrl) {
        var credentialsUtil = new GliderGitCredentialsUtil();
        var repoMatch = credentialsUtil.getIdeGitCredential(resourceUrl);
        var ideGitCredentialSysId = repoMatch && repoMatch.sys_id;
        if (ideGitCredentialSysId) {
            var ideGitCredentialGr = new GlideRecord('sn_glider_ide_git_credential');
            // Mark existing user credential as inactive to allow only 1 active credential per git provider
            if (ideGitCredentialGr.get(ideGitCredentialSysId)) {
                gs.info('[IDE] Deactivating IDE Git credential sys_id={0}', ideGitCredentialSysId);
                ideGitCredentialGr.active = false;
                ideGitCredentialGr.update();
            }
        }
    }

    function createIdeGitCredentialRecord(authCredentialSysId, authCredentialTable, resourceUrl, newCredentialName) {
        var ideGitCredentialGr = new GlideRecord('sn_glider_ide_git_credential');
        ideGitCredentialGr.initialize();
        ideGitCredentialGr.active = true;
        if (authCredentialTable === 'basic_auth_credentials')
            ideGitCredentialGr.auth_credential = authCredentialSysId;
        else if (authCredentialTable === 'oauth_2_0_credentials')
            ideGitCredentialGr.auth_credential_oauth = authCredentialSysId;
        else return null;
        ideGitCredentialGr.auth_credential_table = authCredentialTable;
        ideGitCredentialGr.remote_resource = resourceUrl;
        ideGitCredentialGr.user = gs.getUserID();
        ideGitCredentialGr.name = newCredentialName;

        return ideGitCredentialGr.insert();
    }

    return response;

})(request, response);
