var GliderGitRelay = Class.create();
GliderGitRelay.BLOCKED_REQUEST_CODE = 'relay_request_blocked';
GliderGitRelay.allowHeaders = [
    'accept-encoding',
    'accept-language',
    'accept',
    'access-control-allow-origin',
    'cache-control',
    'connection',
    'content-type',
    'dnt',
    'git-protocol',
    'pragma',
    'range',
    'referer',
    'user-agent',
    'x-http-method-override',
    'x-requested-with'
];
GliderGitRelay.exposeHeaders = [
    'accept-ranges',
    'age',
    'cache-control',
    'content-language',
    'content-type',
    'date',
    'etag',
    'expires',
    'last-modified',
    'location',
    'pragma',
    'server',
    'vary',
    'x-github-request-id',
    'x-redirected-url'
];

GliderGitRelay.allowMethods = [
    'POST',
    'GET',
    'OPTIONS'
];

GliderGitRelay.binaryTypes = {
    table: 'sys_ws_operation',
    sysId: '29b6ac31a3273110c4383702f31e61e5',
    contentType: 'application/octet-stream',
    request: ['application/x-git-receive-pack-request'],
    response: ['application/x-git-upload-pack-advertisement', 'application/x-git-upload-pack-result', 'application/x-git-receive-pack-result']
};

GliderGitRelay.gitCredentialsStatusMessageMap = {
    notFound: sn_i18n.Message.getMessage('glider_ide:git', 'credentials_not_found'),
    invalid: sn_i18n.Message.getMessage('glider_ide:git', 'credentials_invalid'),
    oauthInit: sn_i18n.Message.getMessage('glider_ide:git', 'oauth_initialization_needed'),
    found: sn_i18n.Message.getMessage('glider_ide:git', 'credentials_found'),
    unknown: sn_i18n.Message.getMessage('glider_ide:git', 'credentials_issue_unknown')
};
GliderGitRelay.gitCredentialsStatusResponseErrorCodeMap = {
    notFound: 404,
    invalid: 400,
    oauthInit: 401,
    found: 200,
    unknown: 500
};
GliderGitRelay.ALLOWED_REST_METHOD_TYPES = ['GET', 'POST'];
GliderGitRelay.MID_IDS = {
    appID: 'fd254d9443a161100967247e6bb8f200',
    capALL: 'eeab973fd7802200bdbaee5b5e610381',
    capREST: '18409d8007482000dada43c0d1021e8f'
};
GliderGitRelay.saveAttachmentIssues = {
    midUserRole: sn_i18n.Message.getMessage('glider_ide:git', 'mid_user_role_missing'),
    userRole: sn_i18n.Message.getMessage('glider_ide:git', 'user_role_missing')
};
GliderGitRelay.requestValidationMessages = {
    blocked: sn_i18n.Message.getMessage('glider_ide:git', 'host_not_allowed')
};
GliderGitRelay.GIT_SERVICES = ['git-upload-pack', 'git-receive-pack'];
GliderGitRelay.INTERNAL_DOMAINS = ['service-now.com', 'servicenow.com'];
/**
 * If glide.attachment.extensions is not empty, IDE requires following extensions added to this property.
 * Note: .gitdata is a custom extension used to save binary data response from Git providers.
 */
GliderGitRelay.attachmentContentTypeToExtensionMap = {
    'text/plain': gs.getProperty('sn_glider.git.attachment.extension.text', 'txt'),
    'application/octet-stream': gs.getProperty('sn_glider.git.attachment.extension.binary', 'gitdata')
};
/**
 * Let isomorphic git handle these http status codes
 * 403 Forbidden request (when access token has insufficient permissions)
 * 422 Unprocessable entity (when gitlab urls are missing .git suffix)
 * 401 Unauthorized access (when access token is expired)
 */
GliderGitRelay.HTTP_ERROR_STATUS_HANDLED_BY_CLIENT = [401, 403, 422];

/**
 * Performs relay request and returns result
 * @param request RESTAPIRequest
 * @param response RESTAPIResponse
 * @param methodType string 'GET' | 'POST'
 * @returns RESTAPIResponse
 */
GliderGitRelay.execute = function(request, response, methodType) {
    if (GliderGitRelay.ALLOWED_REST_METHOD_TYPES.indexOf(methodType) == -1) {
        gs.error('[IDE] Http Method type not supported');
        response.setStatus(400);

        return response;
    }
    if (!request.queryParams.extUrl) {
        gs.error('[IDE] No external URL specified');
        response.setStatus(400);

        return response;
    }
    var sanitizedExtUrlParam = String(request.queryParams.extUrl).split('#')[0];
    /**
     * The external url is passed as a query parameter in the relay request
     * This external URL sent from the client is of the following forms:
     * Case 1. <repo-url>/info/refs?service=git-upload-pack
     * Case 2. <repo-url>/git-upload-pack
     * We now prepare the RESTMessageV2 request object where the endpoint and query parameters are set from the above external URL
     * We also use the above external URL to get the repository URL which is used to match git credentials
     * TODO: Add support for non-SSL git providers STRY58491235
     */
    var extUrlFromClient = GliderGitRelay.getGitRepositoryUrlScheme() + sanitizedExtUrlParam;
    var extUrlParts = extUrlFromClient.split('?');
    var extUrl = extUrlParts[0];
    var queryString = extUrlParts[1] || '';

    if (!GliderGitRelay.isValidIsomorphicGitRequest(methodType, extUrl, queryString)) {
        gs.error('[IDE] Rejected relay request that is not a git smart-HTTP request: {0} {1}', methodType, extUrl);
        GliderGitRelay.setBlockedResponse(response, '');

        return response;
    }

    var repoUrl = extUrl.endsWith('/info/refs') ? extUrl.slice(0, -'/info/refs'.length) : extUrl.slice(0, extUrl.lastIndexOf('/'));

    if (!repoUrl) {
        gs.error('[IDE] Unable to determine repository URL');
        response.setStatus(400);

        return response;
    }

    var targetHostname = GliderGitRelay.extractHostname(extUrl);
    if (GliderGitRelay.isPrivateOrInternalHost(targetHostname)) {
        gs.error('[IDE] Rejected relay request to private or internal host: {0} ({1})', targetHostname, extUrl);
        GliderGitRelay.setBlockedResponse(response, repoUrl);

        return response;
    }

    var allReqHeaders = request.headers;

    var relay = new sn_glider.GliderGitRelay(extUrl, methodType, queryString);
    relay.setRequestHeaders(allReqHeaders);

    relay.setGitHeaderAndUpdateCredentialStatus(repoUrl);
    if (relay.credentialStatus !== 'found') {
        // Error in servicenow IDE credential setup
        relay.setGitCredentialErrorResponse(response, repoUrl);
    } else {
        if (methodType == 'POST') {
            var dataStream = request.body.dataStream;
            relay.setRequestBody(dataStream, extUrlFromClient);
        }

        var extRes = relay.getReponseResult(extUrlFromClient);
        response.setStatus(extRes.statusCode);
        response.setHeaders(extRes.headers);
        if (extRes['error']) {
            // Error from git provider
            relay.setGitCredentialErrorResponse(response, repoUrl, extRes.statusCode, extRes['error']);
        } else {
            var writer = response.getStreamWriter();
            relay.sendResponse(writer, extRes);
        }
    }

    return response;
};

/**
 * Returns the git repository url scheme
 * @returns {string} the git repository url scheme
 * Default scheme is https://
 */
GliderGitRelay.getGitRepositoryUrlScheme = function() {
    return gs.getProperty('sn_glider.git.repository_url_scheme', 'https://');
};

GliderGitRelay.extractHostname = function(url) {
    var authorityMatch = /^https?:\/\/([^\/?#]*)/i.exec(url || '');
    if (!authorityMatch)
        return '';

    var authority = authorityMatch[1];
    var atIndex = authority.lastIndexOf('@');
    var hostname = (atIndex >= 0 ? authority.slice(atIndex + 1) : authority).split(':')[0].toLowerCase();

    // DNS-name characters only, deliberately fail-closed: percent-encoding, unicode
    // lookalikes, whitespace and bracketed IPv6 literals all return '' here, which
    // isPrivateOrInternalHost treats as private. Git hosts are never IPv6 literals.
    return /^[a-z0-9.-]+$/.test(hostname) ? hostname : '';
};

GliderGitRelay.isValidIsomorphicGitRequest = function(methodType, extUrl, queryString) {
    var method = String(methodType || '').toUpperCase();
    var url = String(extUrl || '');
    var query = String(queryString || '');
    var services = GliderGitRelay.GIT_SERVICES;

    if (method === 'GET') {
        if (!url.endsWith('/info/refs'))
            return false;

        for (var i = 0; i < services.length; i++) {
            if (query === 'service=' + services[i])
                return true;
        }

        return false;
    }

    if (method === 'POST') {
        if (query)
            return false;

        for (var j = 0; j < services.length; j++) {
            if (url.endsWith('/' + services[j]))
                return true;
        }

        return false;
    }

    return false;
};

GliderGitRelay.setBlockedResponse = function(response, repoUrl) {
    response.setStatus(403);
    response.setBody({
        code: GliderGitRelay.BLOCKED_REQUEST_CODE,
        message: GliderGitRelay.requestValidationMessages.blocked,
        repoUrl: repoUrl || '',
        credsysid: '',
        statusCode: 403,
        authorizationUrl: null
    });
};

GliderGitRelay.isPrivateOrInternalHost = function(hostname) {
    var host = String(hostname || '').replace(/\.+$/, '');

    if (!host)
        return true;

    if (host === 'localhost')
        return true;

    for (var d = 0; d < GliderGitRelay.INTERNAL_DOMAINS.length; d++) {
        var internalDomain = GliderGitRelay.INTERNAL_DOMAINS[d];
        if (host === internalDomain || host.endsWith('.' + internalDomain))
            return true;
    }

    var ipv4Match = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(host);
    if (ipv4Match) {
        var octet1 = parseInt(ipv4Match[1], 10);
        var octet2 = parseInt(ipv4Match[2], 10);
        if (octet1 === 0) return true;
        if (octet1 === 127) return true;
        if (octet1 === 10) return true;
        if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
        if (octet1 === 192 && octet2 === 168) return true;
        if (octet1 === 169 && octet2 === 254) return true;

        return false;
    }

    if (host.indexOf('.') === -1)
        return true;

    return false;
};

GliderGitRelay.constructAttachmentName = function(responseType, externalUrlFromGitClient) {
    let name = responseType;
    const allowedExtensionsProperty = gs.getProperty('glide.attachment.extensions', '');

    /**
     * If glide.attachment.extensions is empty, all extensions are allowed. 
     * Also the checks for file extension and MIME types get short-circuited.
     * In this case, we use an attachment name without extension
     */
    if (allowedExtensionsProperty === '')
        return name;

    const textContentType = 'text/plain';
    const binaryContentType = 'application/octet-stream';
    const allowedExtensions = allowedExtensionsProperty.split(',');
    const extensionForTextContent = GliderGitRelay.attachmentContentTypeToExtensionMap[textContentType];
    const extensionForBinaryContent = GliderGitRelay.attachmentContentTypeToExtensionMap[binaryContentType];

    if (!allowedExtensions.includes(extensionForTextContent) || !allowedExtensions.includes(extensionForBinaryContent)) {
        const errorMessage = sn_i18n.Message.getMessage('glider_ide:git', 'attachment_extensions_not_allowed', {
            extensionForTextContent,
            extensionForBinaryContent
        });
        throw new Error(errorMessage);
    }

    const useBlacklist = gs.getProperty('glide.security.attachment_type.use_blacklist', false);
    if (useBlacklist) {
        const blacklistedTypes = gs.getProperty('glide.attachment.blacklisted.types', '');
        if (blacklistedTypes.includes(textContentType) || blacklistedTypes.includes(binaryContentType)) {
            const errorMessage = sn_i18n.Message.getMessage('glider_ide:git', 'attachment_content_types_not_allowed', {
                textContentType,
                binaryContentType
            });
            throw new Error(errorMessage);
        }
        const blacklistedExtensions = gs.getProperty('glide.attachment.blacklisted.extensions', '');
        if (blacklistedExtensions.includes(extensionForTextContent) || blacklistedExtensions.includes(extensionForBinaryContent)) {
            const errorMessage = sn_i18n.Message.getMessage('glider_ide:git', 'attachment_extensions_blacklisted', {
                extensionForTextContent,
                extensionForBinaryContent
            });
            throw new Error(errorMessage);
        }
    }


    /**
     * MIME type validation is controlled by property glide.security.file.mime_type.validation
     * If true, the attachment should have appropriate extension to pass this validation.
     * Note: Requests for info/refs will return a text/plain response. We use a text friendly extension here to always pass MIME type validation.
     */
    const fileExtension = externalUrlFromGitClient.indexOf('info/refs') >= 0 ? extensionForTextContent : extensionForBinaryContent;
    name = `${responseType}.${fileExtension}`;

    return name;
};

GliderGitRelay.prototype = {
    initialize: function(extUrl, httpMethod, queryString) {
        if (!extUrl || !httpMethod || !extUrl.startsWith(GliderGitRelay.getGitRepositoryUrlScheme()) || GliderGitRelay.allowMethods.indexOf(httpMethod.toUpperCase()) < 0)
            throw new Error('invalid parameter for outbound git calls');

        var extReq = new sn_ws.RESTMessageV2();
        extReq.setHttpMethod(httpMethod);
        extReq.setLogLevel('all');

        extReq.setEndpoint(extUrl);

        if (queryString && queryString.indexOf('=') > 0) {
            var qsName = queryString.split('=');
            extReq.setQueryParameter(qsName[0], qsName[1]);
        }

        this.extReq = extReq;
        this.method = httpMethod;
        this.cleanupAttach = [];
        this.credentialStatus = 'unknown';
        this.credentialResult = {};
        this.credentialSysId = '';
        gs.info('Relay-' + this.method + ':1:outURL:' + extUrl + (queryString ? ('?' + queryString) : ''));
    },

    setRequestHeaders: function(allReqHeaders) {
        for (var h in allReqHeaders) {
            if (GliderGitRelay.allowHeaders.indexOf(h) >= 0)
                this.extReq.setRequestHeader(h, allReqHeaders[h]);
            else if (h === 'authorization')
                this.extReq.setRequestHeader('authorization', allReqHeaders[h]);
        }

        var extReqUA = this.extReq.getRequestHeader('user-agent');
        if (!extReqUA || !extReqUA.startsWith('git/')) {
            this.extReq.setRequestHeader('user-agent', 'git/@sn_glider_relay_v1');
        }

        this.reqContentType = allReqHeaders['content-type'];
        this.reqAccept = allReqHeaders['accept'];
        if (!this.reqAccept || this.reqAccept === '*/*')
            this.reqAccept = GliderGitRelay.binaryTypes.response[0];
        gs.info('Relay-' + this.method + ':2:outHEADER:' + JSON.stringify(this.extReq.getRequestHeaders()));

        var midServer = this.getMIDServerConfig();
        if (midServer) {
            this.extReq.setMIDServer(midServer); //property glide.rest.outbound.ecc_response.timeout controls default response timeout (in seconds) for ecc REST
            this.extReq.setEccParameter('skip_sensor', true); //prevent Discovery sensors running for the ECC input
            gs.info('Relay-' + this.method + ':2.1:MIDServer:' + midServer);
        }
    },

    setRequestBody: function(dataStream, extUrlFromClient) {
        var getLatestAttachId = function(fileName, fileContentType) {
            var gr = new GlideRecord('sys_attachment');
            gr.addQuery('file_name', fileName);
            gr.addQuery('content_type', fileContentType);
            gr.orderByDesc('sys_created_on');
            gr.setLimit(1);
            gr.query();
            return gr.next() ? gr.getValue('sys_id') : null;
        };

        if (GliderGitRelay.binaryTypes.request.indexOf(this.reqContentType) >= 0) {
            // Constructing an attachment to send git push payload to the Git provider
            const fileName = GliderGitRelay.constructAttachmentName(this.reqContentType.split('/')[1], extUrlFromClient);
            var fileContentType = GliderGitRelay.binaryTypes.contentType;

            var grFile = new GlideRecord(GliderGitRelay.binaryTypes.table);
            grFile.get(GliderGitRelay.binaryTypes.sysId);

            var attach = new GlideSysAttachment();
            attach.writeContentStream(grFile, fileName, fileContentType, dataStream);

            var attachmentSysId = getLatestAttachId(fileName, fileContentType);
            if (attachmentSysId) {
                this.extReq.setRequestBodyFromAttachment(attachmentSysId);
                this.cleanupAttach.push(attachmentSysId);
            } else {
                gs.error('Relay-' + this.method + 'could not create attachment for ' + fileName + ' fileContentType: ' + fileContentType);
            }

            gs.info('Relay-' + this.method + ':2.1:outBODYAttach:' + attachmentSysId);
        } else {
            var reqBodyString = '';
            var textReader = new GlideTextReader(dataStream);
            var line = textReader.readLine();
            while (line !== null) {
                reqBodyString += line + "\n";
                line = textReader.readLine();
            }
            this.extReq.setRequestBody(reqBodyString);
            gs.info('Relay-' + this.method + ':2.1:outBODY:' + reqBodyString);
        }
    },

    getReponseResult: function(externalUrlFromGitClient) {
        var isSavingToAttachment = GliderGitRelay.binaryTypes.response.indexOf(this.reqAccept) >= 0;
        if (isSavingToAttachment) {
            try {
                // Constructing an attachment to get all responses from the Git provider
                const fileName = GliderGitRelay.constructAttachmentName(this.reqAccept.split('/')[1], externalUrlFromGitClient);
                this.extReq.saveResponseBodyAsAttachment(GliderGitRelay.binaryTypes.table, GliderGitRelay.binaryTypes.sysId, fileName);
            } catch (error) {
                return {
                    statusCode: 500,
                    error: error.message
                };
            }
        }

        var extRes = this.extReq.executeAsync();
        extRes.waitForResponse(600); // 10minutes timeout, only overwrite the default timeout if glide.http.outbound.max_timeout.enabled is false, default is 5min. See KB1430129

        var extResStatus = extRes.getStatusCode();

        var extResInfo = {
            statusCode: extResStatus
        };

        var headers = extRes.getAllHeaders();
        var extHeaders = {};
        for (var h in headers) {
            extHeaders[headers[h].name] = headers[h].value;
        }
        gs.info('Relay-' + this.method + '3.0:inHeaders:' + JSON.stringify(extHeaders));

        var resHeaders = {};
        /** 
         GliderGitRelay.exposeHeaders is the default list of headers that will be allowed to be sent back to the browser.
         To override this default list, set commma separated values for allowed headers as the system property `sn_glider.git.exposed_headers`.
         Note: You will need to create the system property sn_glider.git.exposed_headers if it does not exist.
        */
        var defaultExposedHeaders = GliderGitRelay.exposeHeaders.join(',');
        var exposeHeaders = gs.getProperty('sn_glider.git.exposed_headers', defaultExposedHeaders).split(',');
        for (var i in extHeaders) {
            if (exposeHeaders.indexOf(i.toLowerCase()) >= 0) {
                resHeaders[i] = extHeaders[i];
            }
        }
        extResInfo['headers'] = resHeaders;
        gs.info('Relay-' + this.method + '3.1:downHeaders:' + JSON.stringify(resHeaders));

        if (extRes.haveError()) {
            const errorMessage = isSavingToAttachment ? extRes.getErrorMessage() : extRes.getBody();
            extResInfo['error'] = isSavingToAttachment ? extRes.getErrorMessage() : extRes.getBody();
            if (errorMessage === 'Unable to save response body as attachment: User not authorized') {
                const midServer = this.getMIDServerConfig();
                extResInfo = {
                    statusCode: 500,
                    error: GliderGitRelay.saveAttachmentIssues[midServer ? 'midUserRole' : 'userRole']
                };
            } else {
                /** 
                 * GliderGitRelay.HTTP_ERROR_STATUS_HANDLED_BY_CLIENT is the default list of error codes that will be allowed to be sent back to the browser.
                 * To override this default list, set commma separated values for allowed codes as the system property `sn_glider.git.client_error_codes`.
                 * Note: You will need to create the system property sn_glider.git.client_error_codes if it does not exist.
                 */
                const defaultErrorCodesHandledByClient = GliderGitRelay.HTTP_ERROR_STATUS_HANDLED_BY_CLIENT.join(',');
                const errorCodesHandledByClient = gs.getProperty('sn_glider.git.client_error_codes', defaultErrorCodesHandledByClient).split(',');
                extResInfo = {
                    statusCode: errorCodesHandledByClient.includes(extResStatus.toString()) ? extResStatus : 500,
                    error: errorMessage
                };
            }
            gs.info('Relay-' + this.method + '3.3:Error:' + extResStatus + ":" + extResInfo['error']);
        } else {
            if (isSavingToAttachment) {
                var attachmentSysId = extRes.getResponseAttachmentSysid();
                extResInfo['attachmentSysId'] = attachmentSysId;
                this.cleanupAttach.push(attachmentSysId);
                gs.info('Relay-' + this.method + '4.1:attachmentSysId:' + attachmentSysId);
            } else {
                extResInfo['body'] = extRes.getBody();
            }
        }
        gs.info('Relay-' + this.method + '3.2:inRESPOND:' + extResStatus + ":" + JSON.stringify(resHeaders));
        return extResInfo;
    },

    sendResponse: function(streamWriter, extRes) {
        if (extRes.attachmentSysId) {
            var attachment = new GlideSysAttachment();
            var attachmentStream = attachment.getContentStream(extRes.attachmentSysId);
            streamWriter.writeStream(attachmentStream);
        } else {
            streamWriter.writeString(extRes.body || extRes.error);
        }
        this.cleanAttachment();
    },

    cleanAttachment: function() {
        try {
            if (this.cleanupAttach.length > 0) {
                var purger = new global.AttachmentActionsUtil();
                purger.deleteAttachments(this.cleanupAttach.join(','));
            }
        } catch (err) {
            gs.info('Relay-' + this.method + '4:cleanAttachment error:' + JSON.stringify(err));
        }
    },

    /** detect MID server configured capability */
    hasMIDServerCapability: function(midServerSysId, capability) {
        var grCapability = new GlideRecord('ecc_agent_capability_m2m');
        grCapability.addQuery('agent', midServerSysId);
        grCapability.addQuery('capability', capability);
        grCapability.query();
        return grCapability.hasNext();
    },

    /** read the MID Server configuration for sn_glider app */
    getMIDServerConfig: function() {
        var grEccAgentApp = new GlideRecord('ecc_agent_application');
        grEccAgentApp.addActiveQuery();
        grEccAgentApp.addQuery('sys_scope', GliderGitRelay.MID_IDS.appID);
        grEccAgentApp.orderByDesc('sys_created_on'); // app <=> MID is m2m, pick the latest active one
        grEccAgentApp.query();

        var midServer = null;
        if (grEccAgentApp.next()) {
            var midServerSysId = grEccAgentApp.default_mid_server.sys_id;
            var hasAllCapability = this.hasMIDServerCapability(midServerSysId, GliderGitRelay.MID_IDS.capALL);
            var hasRestCapability = this.hasMIDServerCapability(midServerSysId, GliderGitRelay.MID_IDS.capREST);
            if (hasAllCapability || hasRestCapability) {
                midServer = grEccAgentApp.default_mid_server.name;
                gs.info('Relay-' + this.method + ':found configured MID Server:' + midServer + ' - REST:' + hasRestCapability + ' - ALL:' + hasAllCapability);
            } else {
                gs.info('Relay-' + this.method + ':ignore configured MID Server:' + grEccAgentApp.default_mid_server.name.toString() + ' -- no required capability');
            }
        }
        return midServer;
    },

    /**
     * Set Authorization request header required by git providers.
     * Also updates credentialStatus for GliderGitRelay object
     * @param repoUrl String
     * @returns void
     */
    setGitHeaderAndUpdateCredentialStatus: function(repoUrl) {
        if (!repoUrl)
            return;
        this.credentialSysId = '';
        var glideUsername = gs.getUserName();
        var credentialsUtil = new GliderGitCredentialsUtil();

        var repoMatch = credentialsUtil.getIdeGitCredential(repoUrl);
        var ideGitCredentialSysId = repoMatch && repoMatch.sys_id;
        if (!ideGitCredentialSysId) {
            gs.info('[IDE] User {0} has no git credentials for repo {1}', glideUsername, repoUrl);
            this.credentialStatus = 'notFound';
            return;
        }

        var gitCredentials = credentialsUtil.getGitCredentials(ideGitCredentialSysId);
        if (!gitCredentials) {
            gs.info('[IDE] Credential sys_id = {0} does not exist', ideGitCredentialSysId);
            this.credentialStatus = 'invalid';
            return;
        }
        if (gitCredentials.authorizationUrl) {
            this.credentialResult = {
                authorizationUrl: gitCredentials.authorizationUrl
            };
        }
        if (!gitCredentials.token) {
            // If no oauth token is available, we need to initialize oauth flow
            this.credentialStatus = 'oauthInit';
            this.credentialSysId = ideGitCredentialSysId;
            return;
        }
        var gitRequestHeader = this.generateGitRequestHeader(gitCredentials.gitUserName, gitCredentials.token);

        if (gitRequestHeader == null) {
            gs.error('[IDE] Unable to set git request header for user {0} with git username {1}', glideUsername, gitCredentials.gitUserName);
            this.credentialStatus = 'invalid';
            return;
        }

        this.extReq.setRequestHeader('authorization', gitRequestHeader['x-ide-git-auth']);

        this.credentialStatus = 'found';
        this.credentialSysId = ideGitCredentialSysId;
    },

    /**
     * Generates x-ide-git-auth Authorization request header required by git providers
     * @param gitUserName String
     * @param token String
     */
    generateGitRequestHeader: function(gitUserName, token) {

        if (!gitUserName || !token)
            return null;

        var authHeaderValue = gs.base64Encode(gitUserName + ':' + token);
        return {
            'x-ide-git-auth': 'Basic ' + authHeaderValue
        };
    },

    /**
     * Creates error responses for git credential issues
     * @param repoUrl String
     * @param response RESTAPIResponse
     * @returns void
     */
    setGitCredentialErrorResponse: function(response, repoUrl, statusCode, errorMessage) {
        var responseStatus = statusCode || GliderGitRelay.gitCredentialsStatusResponseErrorCodeMap[this.credentialStatus];
        var message = errorMessage || GliderGitRelay.gitCredentialsStatusMessageMap[this.credentialStatus];
        response.setStatus(responseStatus);
        response.setBody({
            message: message,
            repoUrl: repoUrl,
            credsysid: this.credentialSysId,
            statusCode: responseStatus,
            authorizationUrl: this.credentialResult.authorizationUrl
        });
    },

    type: 'GliderGitRelay'
};
