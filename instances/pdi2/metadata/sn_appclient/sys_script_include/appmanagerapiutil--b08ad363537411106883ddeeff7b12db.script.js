var AppManagerApiUtil = Class.create();
AppManagerApiUtil.prototype = {
    initialize: function(request, response) {
        this.httpRequest = request;
        this.httpResponse = response;
        this.SUCESS_RESPONSE_CODE = 200;
        this.JSON_CONTENT_TYPE = "application/json";
    },

    getRequestParams: function() {
        if (this.params)
            return this.params;
        this.params = {};
        this.params.queryParams = {};
        Object.keys(this.httpRequest.queryParams).forEach(function(key) {
            this.params.queryParams[key] = this.httpRequest.queryParams[key].toString();
        }, this);
        this.params.pathParams = this.httpRequest.pathParams || {};
        return this.params;
    },
    
    getRequestBody: function() {
        var body =  this.httpRequest.body || {};
        return body.data || {};
    },

    verifyTablesReadAccess: function(tables) {
        if (!Array.isArray(tables)) {
            gs.info("verifyTablesReadAccess: No valid tables provided. Skipping permission checks.");
            return;
        }
	
        tables.forEach(function(tableName) {
            if (!tableName || typeof tableName !== "string" || !tableName.trim()) {
                gs.error("verifyTablesReadAccess: Skipping invalid table name: " + tableName);
                throw {
                    errorCode: 400,
                    errorDescription: gs.getMessage("Invalid table name provided: {0}", tableName),
                    errorAction: "Ensure the table is valid and not empty."
                };
            }
            var gr = new GlideRecordSecure(tableName);
            if (!gr.canRead()) {
                gs.error("verifyTablesReadAccess: No permission to read table: " + tableName);
                throw {
                    errorCode: 403,
                    errorDescription: gs.getMessage("You do not have read permission for required table: {0}", tableName),
                    errorAction: "Check your roles or contact your administrator."
                };
            }
        });
    },

    verifyTablesWriteAccess: function(tables) {
        if (!Array.isArray(tables)) {
            gs.info("verifyTablesWriteAccess: No valid tables provided. Skipping permission checks.");
            return;
        }
        tables.forEach(function(tableName) {
            if (!tableName || typeof tableName !== "string" || !tableName.trim()) {
				gs.error("verifyTablesWriteAccess: Skipping invalid table name: " + tableName);
				throw {
					errorCode: 400,
					errorDescription: gs.getMessage("Invalid table name provided: {0}", tableName),
					errorAction: "Ensure the table is valid and not empty."
				};
            }
	    var gr = new GlideRecordSecure(tableName);
            if (!gr.canWrite()) { 
                gs.error("verifyTablesWriteAccess: No permission to write to table: " + tableName);
                throw {
                    errorCode: 403,
                    errorDescription: gs.getMessage("You do not have write permission for required table: {0}", tableName),
                    errorAction: "Check your roles or contact your administrator."
                };
            }
        });
    },

    logErrorMessage: function(message) {
        gs.error("AppManagerApiUtil: Error with resource: {0} with request-params: {1} is {2}", this.httpRequest.uri, JSON.stringify(this.params), message);
    },

    setResponseBody: function(responseData) {
        this.httpResponse.setContentType(this.JSON_CONTENT_TYPE);
        this.httpResponse.setStatus(this.SUCESS_RESPONSE_CODE);
        this.httpResponse.setBody(responseData);
    },

    setHeader: function(header, value) {
        response.setHeader(header, value);
    },

    addTotalCountHeader: function(value) {
        this.setHeader(Constants.HEADER_TOTAL_COUNT, value);
    },

    setError: function(err) {
        this.logErrorMessage(JSON.stringify(err));
        var myError = new sn_ws_err.ServiceError();
        if (err.hasOwnProperty('errorCode')) {
            myError.setStatus(err.errorCode);
        } else {
            myError.setStatus(400);
        }
        if (err.hasOwnProperty('errorDescription')) {
            myError.setMessage(err.errorDescription);
            myError.setDetail(err.errorAction || err.errorDescription);
        } else {
            myError.setMessage(err);
            myError.setDetail(err);
        }
        if (err.hasOwnProperty("stack"))
            myError = err;
        this.httpResponse.setError(myError);
    },

    getPaginationParams: function() {
        if (!this.params)
            this.getRequestParams();
        var paginationParams = {};
        paginationParams[Constants.SYSPARM_OFFSET] = CommonUtils.getOffset(this.params.queryParams);
        paginationParams[Constants.SYSPARM_LIMIT] = CommonUtils.getLimit(this.params.queryParams);
        return paginationParams;
    },

    getSearchTerm: function() {
        var searchTerm = this.params.queryParams[Constants.SEARCH_EXPRESSION];
        if (searchTerm)
            searchTerm = CommonUtils.getEscapedRegExp(searchTerm);
        return searchTerm;
    },
    getFilterParams: function() {
        var filterParamsJSON = this.params.queryParams[Constants.FILTERS_PARAMS];
        var filterParams = [];
        if (filterParamsJSON)
            filterParams = JSON.parse(filterParamsJSON);
        return filterParams;
    },
    getRequestBody: function() {
        var requestBody = '';
        if (this.httpRequest.body)
            requestBody = this.httpRequest.body.data;
        return requestBody;
    },
    type: 'AppManagerApiUtil'
};
