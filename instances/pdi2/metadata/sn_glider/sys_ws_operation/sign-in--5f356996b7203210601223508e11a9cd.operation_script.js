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

        if (!data.requesterId || !data.authType || !data.payload) {
            response.setStatus(400);
            response.setBody({
                status: 'error',
                errorCode: ERROR_CODES.MISSING_PARAMETER,
                errorMessage: sn_i18n.Message.getMessage('sn_glider.auth.error.missing_parameters', 'Missing required parameters: requesterId, authType, and payload are required')
            });
            return;
        }

        var authRequest = {
            providerId: data.requesterId,
            authType: data.authType,
            payload: data.payload
        };

        var authUtil = new sn_glider.AuthUtil();
        var result = authUtil.saveCredential(authRequest);

        response.setStatus(200);
        response.setBody({
            status: 'success',
            data: result
        });

    } catch (ex) {
        var errorMessage = ex.message || sn_i18n.Message.getMessage('sn_glider.auth.error.unknown', 'An unknown error occurred during authentication');
        var errorCode = ex.code || ERROR_CODES.INTERNAL_ERROR;
        var errorStatus = ex.httpStatus || 500;

        gs.error('[IDE] Authentication error: ' + errorMessage + '\n' + ex.stack);

        response.setStatus(errorStatus);
        response.setBody({
            status: 'error',
            errorCode: errorCode,
            errorMessage: errorMessage
        });
    }
})(request, response);
