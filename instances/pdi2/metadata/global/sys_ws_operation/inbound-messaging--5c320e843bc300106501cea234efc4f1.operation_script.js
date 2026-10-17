(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // This endpoint is reachable without authentication. An exception escaping this script is
    // rendered by the platform as a verbose error that leaks the sys_ws_operation / script
    // include sys_id and the failing line number, so nothing may propagate out of here.
    // Callers only ever see a generic message; details go to the system log.
    function respondBadRequest(logMessage) {
        gs.error('Inbound Messaging (/api/now/v1/cs_message): ' + logMessage);
        response.setStatus(400);
        response.setBody({
            status: 'failure',
            error: {
                message: 'Bad Request',
                detail: ''
            }
        });
    }

    try {
        var reqJson;
        try {
            reqJson = JSON.parse(request.body.dataString);
        } catch (parseError) {
            respondBadRequest('unable to parse request payload as JSON');
            return;
        }

        // a deviceType is expected but if it does not exist, assume this is from mweb
        if (!reqJson || typeof reqJson !== 'object' || !reqJson["data"] || typeof reqJson["data"] !== 'object') {
            respondBadRequest('request payload is missing the required "data" object');
            return;
        }

        if (!reqJson["data"]["deviceType"] && reqJson["source"] != "uib") {
            reqJson["data"]["deviceType"] = "mweb";
        }
        var cookies = request.getHeader('Cookie');
        var foundGuestID = "";
        if (cookies == null) {
            var guestHeader = request.getHeader('guest_session_identifier');
            if (guestHeader != null) {
                foundGuestID = guestHeader.toString();
            }
        } else {
            var splitCookie = cookies.split('guest_session_identifier=');
            if (splitCookie.length > 1) {
                // split out just the ID
                var guestIdWithMore = splitCookie[splitCookie.length - 1].split(';');
                foundGuestID = guestIdWithMore[0];
            }
        }
        var ambChannel = request.getHeader("amb-channel");
        var queued = sn_cs.VASystemObject.authorizeAndEnqueueMessage(ambChannel, JSON.stringify(reqJson), foundGuestID);
        if (queued === "UNAUTHORIZED") {
            response.setStatus(403);
        } else if (queued === "ERROR") {
            response.setStatus(400);
        } else if (queued === "INVALID") {
            response.setStatus(409);
        }
    } catch (e) {
        respondBadRequest('unexpected error processing inbound message: ' + e);
    }

})(request, response);
