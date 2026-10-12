(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var TOKEN_TYPES = {
        TABLE: "table",
        NONE_OF_THE_ABOVE: "none"
    };

    var STATUS_CODES = {
        OK: "ok",
        NOT_UNDERSTOOD: "not_understood",
        MULTIPLE_TABLES: "multiple_tables",
        RESTRICTED: "restricted",
        ERROR: "error",
    };

    var NO_MATCH = "NO MATCH";

    var nlqApi = sn_nlq.JavascriptProcessorScoped;
    if (!nlqApi) {
        response.setStatus(404);
        response.setError(new sn_ws_err.NotFoundError("The NLQ Scripted API is only supported in Vancouver and above."));
        return response;
    }
    var payload = request.body;
    var queryParams = request.queryParams;
    // verify the payload
    if (!payload || !payload.data || !payload.data.length || !queryParams || !queryParams.user_question || !queryParams.origin) {
        response.setStatus(400);
        response.setError(new sn_ws_err.BadRequestError("Required parameters were missing from the request."));
        return response;
    }
    var userQuestion = Array.isArray(queryParams.user_question) ? queryParams.user_question[0] : queryParams.user_question;
    var origin = Array.isArray(queryParams.origin) ? queryParams.origin[0] : queryParams.origin;
    var tokenArray = payload.data;
    var tableArray = [];
    var unmatchedTokens = [];
    tokenArray.forEach(function(token) {
        if (!token || !token.value)
            return; // invalid token
        if (token.suggestion && token.suggestion.metadata) {
            if (token.suggestion.type === TOKEN_TYPES.TABLE) {
                tableArray.push(token.suggestion.metadata.name);
            } else if (token.suggestion.type === TOKEN_TYPES.NONE_OF_THE_ABOVE) {
                // TODO: this needs to be saved for retrieval later, dependent on NLQ team story
            }
        } else {
            // just an unmatched token
            unmatchedTokens.push(token.value);
        }
    });

    if (tableArray.length === 0) {
        // there are no matched tables, so concat the cmdb_ci table and do a name search
        tableArray.push('cmdb_ci');
        userQuestion = gs.getMessage("Configuration items with name {0}", userQuestion);
    }
    var nlqResponse;
    try {
        nlqResponse = nlqApi.applyMultiTable(tableArray.join(","), userQuestion, origin.toUpperCase());
    } catch (e) {
        // wrap the exception in a server error
        var serverError = new sn_ws_err.ServiceError();
        serverError.setStatus(500);
        serverError.setMessage('NLQ Service encountered an error: ' + e);
        response.setError(serverError);
        response.setBody({
            status_code: STATUS_CODES.ERROR
        });
    }

    if (nlqResponse.errorMessage) {
        // if the parser returns no match, this is a not understood response
        if (nlqResponse.parserOutput === NO_MATCH) {
            response.setBody({
                nlqQueryLogTableSysId: nlqResponse.nlqQueryLogTableSysId,
                status_code: STATUS_CODES.NOT_UNDERSTOOD
            });
        } else {
            // server error, if NO MATCH is not found in payload
            var unknownError = new sn_ws_err.ServiceError();
            unknownError.setStatus(500);
            unknownError.setMessage('NLQ Service encountered an unknown error.');
            response.setError(unknownError);
            response.setBody({
                status_code: STATUS_CODES.ERROR
            });
        }
    } else {
        var body = {
            parserOutput: JSON.parse(nlqResponse.parserOutput),
            nlqQueryLogId: nlqResponse.nlqQueryLogTableSysId,
            status_code: STATUS_CODES.OK
        };
        // single table queries use the table sent in the client payload
        if (body.parserOutput.type != 'cmdb')
            body.table = tableArray[0];

        // add in utterance modification if present
        if (nlqResponse.utteranceModificationType)
            body.utteranceModificationType = nlqResponse.utteranceModificationType;
        if (nlqResponse.modifiedParsedUtterance)
            body.modifiedParsedUtterance = nlqResponse.modifiedParsedUtterance;

        response.setBody(body);
        response.setStatus(200);
    }

})(request, response);
