(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var AuthUtil = sn_glider.AuthUtil;
    var ERROR_CODES = AuthUtil.prototype.ERROR_CODES;
    
    try {
        var requestBody = request.body;

        if (!requestBody || !requestBody.data) {
            response.setStatus(400);
            response.setBody({
                status: 'error',
                errorCode: ERROR_CODES.INVALID_REQUEST,
                errorMessage: sn_i18n.Message.getMessage('sn_glider.auth.error.invalid_request', 'Request body is missing or invalid')
            });
            return;
        }

        var data = requestBody.data;

        if (!data.requesterId) {
            response.setStatus(400);
            response.setBody({
                status: 'error',
                errorCode: ERROR_CODES.MISSING_PARAMETER,
                errorMessage: sn_i18n.Message.getMessage('sn_glider.auth.error.missing_requester_id', 'Missing required parameter: requesterId')
            });
            return;
        }

        var tokenRequest = {
            providerId: data.requesterId,
            scopes: data.scopes || []
        };

        var authUtil = new sn_glider.AuthUtil();
        var result = authUtil.getToken(tokenRequest);

        if (!result || (!result.token && !result.authorizationURL)) {
            response.setStatus(404);
            response.setBody({
                status: 'error',
                errorCode: ERROR_CODES.CREDENTIAL_NOT_FOUND,
                errorMessage: sn_i18n.Message.getMessage('sn_glider.auth.error.token_not_found', 'No valid token found for the specified provider')
            });
            return;
        }

        response.setStatus(200);
        response.setBody({
            status: 'success',
            data: result
        });

    } catch (ex) {
        var errorMessage = ex.message || sn_i18n.Message.getMessage('sn_glider.auth.error.token_retrieval', 'An error occurred while retrieving the authentication token');
        var errorCode = ex.code || ERROR_CODES.INTERNAL_ERROR;
        var errorStatus = ex.httpStatus || 500;

        gs.error('[IDE] Token retrieval error: ' + errorMessage + '\n' + ex.stack);

        response.setStatus(errorStatus);
        response.setBody({
            status: 'error',
            errorCode: errorCode,
            errorMessage: errorMessage
        });
    }
})(request, response);
