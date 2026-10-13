(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var errorMsgPrefix = "Event Management : In Default Bulk Endpoint Scripted Rest API, ";
    var request_body;
    var requestPayloadString;
    try {
        requestPayloadString = request.body.dataString;
        var eventManagementUtils = new SNC.EventManagementScriptableApis();
        request_body = eventManagementUtils.parseJson(requestPayloadString);
    } catch (e) {
        gs.info(errorMsgPrefix + "request payload is " + requestPayloadString);
        gs.error(errorMsgPrefix + "an exception was raised : " + e.toString());
        throw new sn_ws_err.BadRequestError("The request body contains malformed or invalid JSON data");
    }
    try {
        var eventProcessor = new SNC.EvtMgmtEventProcessor();
        var insertedEvents = eventProcessor.insertEvents(request_body);
        var results = {};
        results['Default Bulk Endpoint'] = insertedEvents + " events were inserted";
        return results;
    } catch (e) {
        gs.info(errorMsgPrefix + "request payload is " + requestPayloadString);
        gs.error(errorMsgPrefix + "an exception was raised : " + e.toString());
        if (!request_body) {
            throw new sn_ws_err.BadRequestError("The request payload is null or empty.");
        }
        if (!request_body.hasOwnProperty("records")) {
            throw new sn_ws_err.BadRequestError("The request payload does not contain 'records' key.");
        } else {
            var errorResponseMsg = "The request payload's 'records' value does not contain an array of JSON records or a string that represents an array of JSON records";
            var records = request_body["records"];
            if (typeof records !== 'object') {
                try {
                    records = JSON.parse(records);
                } catch (error) {
                    gs.error(errorMsgPrefix + "an error was occurred. Error Name : " + error.name + ", Error Message : " + error.message);
                    throw new sn_ws_err.BadRequestError(errorResponseMsg);
                }
            }
            if (!Array.isArray(records)) {
                throw new sn_ws_err.BadRequestError(errorResponseMsg);
            } else {
                for (var i = 0; i < records.length; i++) {
                    // Check if the object is a plain JSON object
                    if (Object.prototype.toString.call(records[i]) !== '[object Object]' || records[i] == null) {
                        throw new sn_ws_err.BadRequestError(errorResponseMsg);
                    }
                }
            }
        }
        throw e;
    }
})(request, response);
