var UXARestMessageUtil = Class.create();
UXARestMessageUtil.prototype = {
    initialize: function() {},
    
    // Setup KAA authenticated REST message
    setupRestMessage: function(endpoint, httpMethod, requestBody, customHeaders) {
        try {
            // Create REST message with provided endpoint
            var centralInstanceUrl = gs.getProperty("glide.ua.downloader.central_instance");
            if (!centralInstanceUrl) {
                gs.debug('UXARestMessageUtil: Error: Central Instance URL is missing');
                return null;
            }
            var restMessage = new sn_internal_services.ServiceRESTMessage(centralInstanceUrl + endpoint);
            
            // Set HTTP method
            restMessage.setHttpMethod(httpMethod);

            // Set Request Body
            if (requestBody && Object.keys(requestBody).length > 0) {
                restMessage.setRequestBody(JSON.stringify(requestBody));
            }
            
            // Set standard headers
            restMessage.setRequestHeader('Accept', 'application/json');
            restMessage.setRequestHeader('Content-Type', 'application/json');

            // Set Custom Headers - handle both object and array formats
            if (customHeaders) {
                // Handle object format: {headerName: 'headerValue'}
                for (var headerName in customHeaders) {
                    restMessage.setRequestHeader(headerName, customHeaders[headerName]);
                }
            }
            
            // KAA specific authentication
            restMessage.setRequestHeader('X-KaaUserClaim', gs.base64Encode('usage_sync_user'));
            restMessage.setIdentityCertificateMutualAuth(true);
            
            return restMessage;
            
        } catch (e) {
            gs.debug('UXARestMessageUtil: Error setting up KAA request: ' + e.message);
            return null;
        }
    },
    
    type: 'UXARestMessageUtil'
};
