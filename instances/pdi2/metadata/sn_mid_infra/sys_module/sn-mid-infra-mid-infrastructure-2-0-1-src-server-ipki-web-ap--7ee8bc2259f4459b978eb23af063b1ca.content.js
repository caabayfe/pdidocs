/**
 * Process function to handle the agent registration request.
 * 
 * @param {RESTAPIRequest} request - The incoming request object.
 * @param {RESTAPIResponse} response - The outgoing response object.
 */
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestData = JSON.parse(JSON.stringify(request.body.data || {}));
    var apiUtil = new MidIPKIApiUtil(requestData);

    gs.info('IPKI Sign Request received. RequestData: ' + apiUtil.getRequestStringForLog());
    
    var errorLog = '';

    // 1. Validate that the request body contains all required data.
    if (!requestData || !requestData.registration_key || !requestData.csr || !requestData.mid_name) {
        errorLog = 'Invalid registration request. Missing registration_key, csr or mid_name. Session Token: ' + gs.getSession().getSessionToken();
        apiUtil.triggerSignCsrEvent(requestData.mid_name, false, errorLog);
        return new WebApiErrorUtility().createServiceError('Invalid registration request.', 400, 'Not all required parameters passed to API.', undefined, errorLog);
    }

    // 2. Validate the registration key. We must validate the registration key before processing the request. Further processing can return errors showing system state.
    var keyManager;
    var keyDetails;
    try {
        keyManager = new RegistrationKeyManager();

        // cannot process request with invalid registration key
        if (!keyManager.verifyRegistrationKey(requestData.registration_key)) {
            errorLog = 'Registration key Invalid. Session Token: ' + gs.getSession().getSessionToken();
            apiUtil.triggerSignCsrEvent(requestData.mid_name, false, errorLog);
            return new WebApiErrorUtility().createServiceError('Invalid registration key', 401, 'Registration key verification failed', undefined, errorLog);
        }

        // 2a. Get key details for tracking and validation
        keyDetails = keyManager.getKeyRecordDetails(requestData.registration_key);
        if (!keyDetails) {
            errorLog = 'Registration key details not found. Session Token: ' + gs.getSession().getSessionToken();
            apiUtil.triggerSignCsrEvent(requestData.mid_name, false, errorLog);
            return new WebApiErrorUtility().createServiceError('Invalid registration key', 401, 'Registration key verification failed', undefined, errorLog);
        }

        // 2b. Increment use count immediately (before any other processing)
        keyManager.incrementUseCount(keyDetails.sysId);
    } catch (e) {
        errorLog = 'Exception encountered validating registration key. Exception Message: ' + e.message + '. Session Token: ' + gs.getSession().getSessionToken();
        apiUtil.triggerSignCsrEvent(requestData.mid_name, false, errorLog);
        return new WebApiErrorUtility().createServiceError('Internal Server Error', 500, 'Unable to validate registration key', undefined, errorLog);
    }

    // 3. Validate the agent if it exists in the request.
    var agentResult = apiUtil.validateAgentInRequest();
    if (!agentResult.valid) {
        apiUtil.triggerSignCsrEvent(requestData.mid_name, false, agentResult.detail);
        return agentResult.error;
    }

    // 4. Validate and sign the Certificate Signing Request (CSR).
    var leafCertFormatted;
    try {
        var result = apiUtil.processSignRequest(keyDetails.assignedTo, keyDetails.sysId);
        if (!result.success) {
            apiUtil.triggerSignCsrEvent(requestData.mid_name, false, result.detail);
            return result.error;
        }

        // Mark key as consumed only after all operations succeed
        keyManager.markConsumed(keyDetails.sysId);

        leafCertFormatted = result.leafCertFormatted;
    } catch (e) {
        errorLog =
            'Exception encountered processing CSR. Exception Message: ' +
            e.message +
            '. Session Token: ' +
            gs.getSession().getSessionToken();
        apiUtil.triggerSignCsrEvent(requestData.mid_name, false, errorLog);
        return new WebApiErrorUtility().createServiceError('Internal Server Error', 500, 'Unable to process csr', undefined, errorLog);
    }

    apiUtil.triggerSignCsrEvent(requestData.mid_name, true, "Certificate provisioned");
    return apiUtil.buildCertificateResponse(leafCertFormatted);
})(request, response);
