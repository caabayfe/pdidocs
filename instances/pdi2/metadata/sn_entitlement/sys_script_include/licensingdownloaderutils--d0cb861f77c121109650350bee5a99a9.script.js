var LicensingDownloaderUtils = Class.create();
LicensingDownloaderUtils.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.centralInstanceURL = gs.getProperty(LicensingEngineConstants.PROP_GLIDE_UA_DOWNLOADER_CENTRAL_INSTANCE, "");

        if (global.LicensingScriptUtil.notNil(this.centralInstanceURL) && !this.centralInstanceURL.endsWith("/"))
            this.centralInstanceURL += "/";
        this.instanceId = gs.base64Encode(gs.getProperty(LicensingEngineConstants.INSTANCE_ID));
        this.instanceName = gs.base64Encode(gs.getProperty(LicensingEngineConstants.INSTANCE_NAME));
        this.MAX_RETRIES = gs.getProperty(LicensingEngineConstants.MAX_RETRY_DEFAULT_COUNT_PROPERTY_KEY, LicensingEngineConstants.MAX_RETRY_DEFAULT_COUNT);
        this.RETRY_CODES = gs.getProperty(LicensingEngineConstants.RETRY_REQD_HTTP_STATUS_PROPERTY, LicensingEngineConstants.RETRY_REQD_DEFAULT_HTTP_STATUS_CODE);

        //error code name
        this.REST_CALL_EXCEPTION = "LIC3001";
        this.EXPONENTIAL_BACKOFF_BASE = gs.getProperty(LicensingEngineConstants.EXPONENTIAL_BACKOFF_BASE_KEY, LicensingEngineConstants.EXPONENTIAL_BACKOFF_BASE_DEFAULT);
    },

    /**
     * makes REST API call
     * @param restObject
     * while building the restObject to specify saveResponseBodyAsAttachment() follow the below format where keys must not be changed
     *  saveResponseAsAttachment => { 'table_name': <any table name>, 'record_sys_id': <any record sysid>, 'attachment_name': <name of the attachment>}
     * @returns REST response object
     */
    executeRESTAPI: function(restObject) {
        var response;
        try {
            if (restObject.end_point) {
                var endPoint = this.centralInstanceURL + restObject.end_point;
                var restMessage = new sn_ws.RESTMessageV2();
                restMessage.setEndpoint(endPoint);
                if (restObject.rest_method)
                    restMessage.setHttpMethod(restObject.rest_method);

                var headers = restObject.headers;
                if (global.LicensingScriptUtil.notNil(headers) && Object.keys(headers).length > 0) {
                    for (var h in headers)
                        restMessage.setRequestHeader(h, headers[h]);
                }
                if (restObject.request_body) {
                    restMessage.setRequestBody(JSON.stringify(restObject.request_body));
                }

                var queryParameters = restObject.query_parameters;
                if (global.LicensingScriptUtil.notNil(queryParameters) && Object.keys(queryParameters).length > 0) {
                    for (var k in queryParameters)
                        restMessage.setQueryParameter(k, queryParameters[k]);
                }

                if (global.LicensingScriptUtil.notNil(restObject.request_body))
                    restMessage.setRequestBody(restObject.request_body);

                if (restObject.save_response_as_attachment) {
                    var saveAsAttachment = restObject.save_response_as_attachment;
                    restMessage.saveResponseBodyAsAttachment(saveAsAttachment['table_name'], saveAsAttachment['record_sys_id'], saveAsAttachment['attachment_name']);
                }
                let retryAttempt = 0;
                let shouldRetry = true;
                while (shouldRetry && retryAttempt++ <= this.MAX_RETRIES) {
                    this.logger.logInfo(this.type, 'executeRESTAPI', 'Rest Request Attempt : ' + retryAttempt + '    of max attempts ' + (1 + parseInt(this.MAX_RETRIES))); // +1 because of 0 indexing
                    shouldRetry = false;
                    response = restMessage.execute();
                    const httpStatusCode = response.getStatusCode().toString();
                    //if 2xx status return response
                    if (httpStatusCode / 100 == 2)
                        return response;
                    else {
                        this.logger.logInfo(this.type, 'executeRESTAPI', 'Rest Response Status Code: ' + httpStatusCode);
                        const retryCodes = this.RETRY_CODES.split(',');
                        //Check if the httpstatus code is one of the retryable codes
                        if (retryAttempt <= this.MAX_RETRIES && retryCodes.includes(httpStatusCode)) {
                            shouldRetry = true;
                            //Add wait time based on the retry attempt number. first attempt will wait 10 seconds, second attempt 30 seconds
                            new global.LicensingEngineGlobalHelper().sleep((Math.pow(2, retryAttempt) - 1) * this.EXPONENTIAL_BACKOFF_BASE);
                        }
                    }
                }
            }
        } catch (error) {
            const errMesg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.REST_CALL_EXCEPTION] + error + " \n " + error.stack;
            this.logger.logError(this.type, "executeRESTAPI", errMesg, this.REST_CALL_EXCEPTION, LicensingEngineConstants.LICENSING_ERROR_TYPES.LICENSING_DOWNLOADER);
        }
        return response;
    },
    type: 'LicensingDownloaderUtils'
};
