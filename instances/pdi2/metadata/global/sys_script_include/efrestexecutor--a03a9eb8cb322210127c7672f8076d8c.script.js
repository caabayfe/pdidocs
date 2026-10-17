class EFRestExecutor {
    constructor() {}
    
    execute(context) {
        try {
            const request = new sn_ws.RESTMessageV2();
            const method = context.method || 'POST';
            
            // Only allow POST, PUT, and PATCH methods for Error Framework actions
            if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
                throw new Error('EFRestExecutor only supports POST, PUT, and PATCH methods for Error Framework actions');
            }
            
            request.setHttpMethod(method);

            let endpoint = context.endpoint;
            request.setEndpoint(endpoint);
            request.setRequestHeader('Content-Type', 'application/json');
            request.setRequestHeader('Accept', 'application/json');

            // Prepare request body with error and execution parameters
            const requestBody = {};
            
            // Handle both individual and bulk actions in request body
            if (context.errorSysIds && Array.isArray(context.errorSysIds))
                requestBody.error_sys_ids = context.errorSysIds;
            else
                requestBody.error_sys_id = context.errorSysId;
            
            requestBody.execution_sys_id = context.executionSysId;
            requestBody.params = context.params || {};

            // Add any additional query parameters if provided
            if (context.queryParams) {
                Object.keys(context.queryParams).forEach(key => {
                    request.setQueryParameter(key, context.queryParams[key]);
                });
            }
            
            // Set the request body
            request.setRequestBody(JSON.stringify(requestBody));

            const response = request.execute();
            const statusCode = response.getStatusCode();
            const responseBody = response.getBody();

            let parsedBody = null;
            try {
                parsedBody = JSON.parse(responseBody);
                
                // Handle cases where the response is nested in body.result
                if (parsedBody && parsedBody.result)
                    parsedBody = parsedBody.result;
            } catch (e) {
                // If not valid JSON, use the raw response
                parsedBody = responseBody;
            }
            
            // Determine success based on HTTP status code
            let success = statusCode >= EFConstants.HTTP_STATUS.SUCCESS_MIN && statusCode < EFConstants.HTTP_STATUS.SUCCESS_MAX;
            
            // Check if the response has a standardized format and extract relevant information
            let message = success ? 'REST request executed successfully' : 'REST request failed';
            let data = null;
            let errorsToClose = [];
            
            // If the REST endpoint returns a standardized format, use it
            if (parsedBody && typeof parsedBody === 'object') {
                if (parsedBody.success !== undefined)
                    success = parsedBody.success === true;
                
                if (parsedBody.message)
                    message = parsedBody.message;
                
                if (parsedBody.data !== undefined)
                    data = parsedBody.data;

                if (parsedBody.errorsToClose && Array.isArray(parsedBody.errorsToClose))
                    errorsToClose = parsedBody.errorsToClose;
            }
            
            return {
                success: success,
                message: message,
                data: data || null,
                errorsToClose: errorsToClose
            };
        } catch (e) {
            return {
                success: false,
                message: 'REST execution error: ' + e.message,
                data: null
            };
        }
    }
    
    validateContext(context) {
        if (!context.endpoint)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "EFRestExecutor.validateContext: REST endpoint is required to execute this action"));

        // Validate that either errorSysId (individual) or errorSysIds (bulk) is provided
        if (!context.errorSysId && !context.errorSysIds)
            throw new Error(sn_i18n.Message.getMessage("error_framework", 'EFRestExecutor.validateContext: Missing errorSysId or errorSysIds in context'));
        
        if (!context.executionSysId)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "EFRestExecutor.validateContext: Missing executionSysId in context"));
    }
}
