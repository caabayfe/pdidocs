/**
* Process function that handles certificate rotation
*
* @param {RESTAPIRequest} request - The request object
* @param {RESTAPIResponse} response - The response object
*/
/* eslint-disable no-unsupported-node-builtins */
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestData = JSON.parse(JSON.stringify(request.body.data || {}));

    gs.info('IPKI Rotation Request received. Session Token: ' + gs.getSession().getSessionToken());

    // Validate request body field
    if (!requestData.csr) {
        return new WebApiErrorUtility().createServiceError('Bad Request', 400, 'csr is required.', undefined, 'IPKI Rotate: Missing csr in request body. Session Token: ' + gs.getSession().getSessionToken());
    }

    var sDataUtil = new global.SessionDataUtil(); 
    var midSysId = sDataUtil.getProperty('mid_auth.mid_sys_id');
    var userSysId = gs.getUser().getID();

    var agentUtil = new AgentUtility();
    var agentGr = agentUtil.getAgentRecord(midSysId);
    var agentName = agentGr ? agentGr.getValue('name') : '';

    var rotateUtil = new IPKIRotateUtil();
    var errorLog = '';

    // Step 2: Cross-validate against ecc_agent and confirm MID is active.
    if (!agentGr) {
        errorLog = 'IPKI Rotate: MID Server not found. Session Token: ' + gs.getSession().getSessionToken();
        rotateUtil.triggerRotateCertEvent(agentName, false, errorLog);
        return new WebApiErrorUtility().createServiceError('Unauthorized', 401, 'MID Server not found.', undefined, errorLog);
    }

    var mapManger = new IPKICertMapManager();
    var mappingRec = mapManger.getActiveRecordByAgent(midSysId);

    var kmfCertificateSysId = undefined;
    var kmfRecord = undefined;
    var kmfCertUtil = new KMFCertificateUtility();

    if (mappingRec) {
        kmfCertificateSysId = mappingRec.getValue('kmf_certificate');
        if (kmfCertificateSysId) {
            kmfRecord = kmfCertUtil.getBySysId(kmfCertificateSysId);
        }
    } 

    if (!kmfRecord) {
        errorLog = 'IPKI Rotate: No Active certificate entry found for MID ' + midSysId + '. Session Token: ' + gs.getSession().getSessionToken();
        rotateUtil.triggerRotateCertEvent(agentName, false, errorLog);
        return new WebApiErrorUtility().createServiceError('Unauthorized', 401, 'Active certificate entry not found for MID.', undefined, errorLog);
    }

    var validUntil = kmfRecord.getValue('valid_until');

    // Step 3: Validate the certificate is within the rotation window or is a forced rotation.
    var inRotationWindow = rotateUtil.isInRotationWindow(validUntil, midSysId);

    gs.debug('IPKI Rotate: inRotationWindow: ' + inRotationWindow + '. Session Token: ' + gs.getSession().getSessionToken());
    var isExpected = mapManger.isRegistrationExpected(midSysId, userSysId);
    gs.debug('IPKI Rotate: inRotationWindow: ' + inRotationWindow + ', isRegistrationExpected: ' + isExpected + ', midSysId: ' + midSysId + ', userSysId: ' + userSysId + '. Session Token: ' + gs.getSession().getSessionToken());

    if (!inRotationWindow && !isExpected) {
        errorLog = 'IPKI Rotate: Certificate rotation is not expected for this MID Server. Session Token: ' + gs.getSession().getSessionToken();
        rotateUtil.triggerRotateCertEvent(agentName, false, errorLog);
        return new WebApiErrorUtility().createServiceError('Forbidden', 403, 'Certificate is not eligible for rotation.', undefined, errorLog);
    }

    // Step 4: Create user-policy mapping for the rotated certificate.
    try {
        var ipkiApiUtil = new MidIPKIApiUtil(requestData);
        ipkiApiUtil.createUserPolicyMapping(userSysId);
    } catch (mappingError) {
        rotateUtil.triggerRotateCertEvent(agentName, false, mappingError.message);
        return new WebApiErrorUtility().createServiceError('Internal Server Error', 500, 'Unable to create user policy mapping', undefined, mappingError.message);
    }

    // Step 5: Sign the CSR and create the processing cert map record.
    var rotationResult = rotateUtil.processRotationRequest(requestData.csr, midSysId);
    if (!rotationResult.success) {
        rotateUtil.triggerRotateCertEvent(agentName, false, rotationResult.detail);
        return rotationResult.error;
    }

    // Step 6: Return the rotation response.
    rotateUtil.triggerRotateCertEvent(agentName, true, 'Certificate rotation completed');
    return rotateUtil.buildRotationResponse(rotationResult.leafCertFormatted);

})(request, response);
