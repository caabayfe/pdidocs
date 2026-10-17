const APIHelper = Class.create();
APIHelper.prototype = {
    initialize: function( /*RESTAPIRequest*/ requsest, /*RESTAPIResponse*/ response) {
        this.REQUEST = request;
        this.RESPONSE = response;
    },
    execute: function(fn) {
        try {
            fn();
        } catch (err) {
            gs.error(`${err}\n${err.stack}`);
            this.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.A_ERROR_HAS_OCCURED, err, 500);
        }
    },
    getDataByQuery: function(dataClass, encodedQuery = '', errorMessage, orderBy = false) {
        const queryResult = dataClass.getRecordsByQuery(encodedQuery, orderBy);
        this.getResponse(queryResult, errorMessage);
    },
    getResponse: function(result, errorMessage = BuilderToolkitConstants.ERRORS.A_ERROR_HAS_OCCURED) {
        if (!result || (Array.isArray(result) && result.length === 0)) {
            return this.respondUnsuccessfully(errorMessage, '', 204);
        }
        this.respondSuccesfully(result);
    },
    getResponseGlideOperation: function(operationResult, errorMessage = BuilderToolkitConstants.ERRORS.A_ERROR_HAS_OCCURED) {
        if (operationResult.error) {
            return this.respondUnsuccessfully(errorMessage, operationResult.reason);
        }
        this.respondSuccesfully({
            sysId: operationResult
        });
    },
    getResponseFromMutliOperation: function(resultObject) {
        const results = Object.values(resultObject);
        const allSucceeded = results.every(this.didOperationSucceed.bind(this));
        const someSucceeded = results.some(this.didOperationSucceed.bind(this));
        if (allSucceeded) {
            return this.respondSuccesfully(resultObject);
        } else if (someSucceeded) {
            this.respondSuccesfully(Object.entries(resultObject).reduce(this.getReducedOperationMessage.bind(this), {}), 207);
        } else {
            this.respondUnsuccessfully(BuilderToolkitConstants.A_ERROR_HAS_OCCURED, resultObject);
        }
    },
    getQueryParam: function(paramName, defaultValue = null) {
        const queryValue = this.REQUEST.queryParams[paramName];
        const typeOfQueryValue = typeof queryValue;
        if (queryValue !== undefined && typeOfQueryValue === 'object') {
            const tempVal = queryValue[0];
            if (tempVal === 'true' || tempVal === 'false') {
                return tempVal === 'true';
            } else if (parseInt(tempVal) === NaN) {
                return parseInt(tempVal, 10);
            } else if (tempVal === 'null') {
                return null;
            } else if (tempVal === 'undefined') {
                return undefined;
            } else {
                return tempVal;
            }
        }
        return queryValue ?? defaultValue;
    },
    getBodyParam: function(key, defaultValue = null) {
        return this.REQUEST.body.data[key] ?? defaultValue;
    },
    getPathParam: function(key, defaultValue = null) {
        return this.REQUEST.pathParams[key] ?? defaultValue;
    },
    respondSuccesfully: function(body = {}, status = 200) {
        this.RESPONSE.setContentType('application/json');
        this.RESPONSE.setStatus(status);
        this.RESPONSE.setBody(body);
    },
    respondUnsuccessfully: function(message = '', details = '', status = 400) {
        this.RESPONSE.setError(
            new sn_ws_err.ServiceError()
            .setStatus(status)
            .setMessage(message)
            .setDetail(details)
        );
    },
    didOperationSucceed: function(value) {
        if (typeof value === 'boolean' || typeof value === 'string') {
            return true;
        }
        if (Array.isArray(value)) {
            return value.every(this.didOperationSucceed);
        }
        return false;
    },
    getReducedOperationMessage: function(acc, [key, value]) {
        if (Array.isArray(value)) {
            acc[key] = value.map(this.getOperationMessage);
        } else {
            acc[key] = this.getOperationMessage(value)
        }
        return acc;
    },
    getOperationMessage: function(value) {
        const error = value?.error ?? false;
        const reason = value?.reason ?? '';
        return {
            status: error ? 400 : 200,
            value: error ? reason : value
        };
    },
    // -------------------
    // HELPERS
    // -------------------

    /**
     * @param message {string} the message we want to log
     * @param prefix {string} the prefix for the log message to find it easier
     */
    _logMessage: function(message, prefix) {
        prefix = prefix || this.type;
        gs.info('{0}\n\n{1}', prefix, message);
    },

    /**
     * @param messageObj {JSON} the JSON object or array we want to log
     * @param prefix {string} the prefix for the log message to find it easier
     */
    _logJSON: function(messageObj, prefix) {
        this._logMessage(JSON.stringify(messageObj, null, 4), prefix);
    },
    type: 'APIHelper'
};
