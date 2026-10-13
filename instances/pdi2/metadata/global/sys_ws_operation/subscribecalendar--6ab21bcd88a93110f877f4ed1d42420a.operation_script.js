(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var tinyID = request.pathParams.tiny_id;
    var tinyGR = new GlideRecord("sys_tiny_url");

    if (tinyGR.get("tiny_url", tinyID)) {
        var requestParams = tinyGR.getValue("data");
        var params = requestParams.split("&");
        var paramsMap = {};
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split("=");
            paramsMap[param[0]] = param[1];
        }

        /**
         * Below check is implemented as a workaround to DEF0457404.
         * 
         * 1. The issue is due to the user session not updated after authentication and it is always stays with previous user session
         * 2. ni.nolog.token query parameter cannot be accessed directly and it results in an array of values. we use queryString to manually get the value and check the access.
         * 
         * Remidation here is to check the token of the tinyurl user and match it with the incoming token to see the request is valid.
         * 
         * This code should be removed / updated after the above PRB is fixed.
         */
        var queryString = request.queryString;
        if (queryString.includes("ni.nolog.token")) {
            queryString = queryString.split("ni.nolog.token=")[1];
        } else {
            response.setStatus(401);
            return;
        }
        if (gs.nil(paramsMap["sysparm_id"]) || !(new OnCallCommonSNC().isValidUserAPIKey(paramsMap["sysparm_id"], queryString))) {
            response.setStatus(401);
            return;
        }

        var useCache = true;
        var useCacheParam = request.queryParams.use_cache;
        if (typeof useCacheParam !== "undefined")
            useCache = useCacheParam == "true";
        try {
            var writer = response.getStreamWriter();
            response.setStatus(200);
            response.setHeader("Content-Type", "text/calendar");
            var groupId = paramsMap["sysparm_group_id"] + "";
            var rotaId = paramsMap["sysparm_rota_id"] + "";
            var userId = paramsMap["sysparm_id"] + "";
            var groupName, shiftName;
            var groupGr = new GlideRecord("sys_user_group");
            if (groupGr.get(groupId)) groupName = groupGr.getValue("name");
            if (rotaId == "all") {
                writer.writeString(new OCRotaICalendar().getGroupCalendarEvents(
                    groupId,
                    null,
                    useCache
                ));
            } else {
                var rotaGr = new GlideRecord("cmn_rota");
                if (rotaGr.get(rotaId)) shiftName = rotaGr.getValue("name");
                writer.writeString(
                    new OCRotaICalendar().getCalendarEvents(
                        groupId,
                        rotaId,
                        userId,
                        null,
                        useCache
                    )
                );
            }
            var fileName = "calendar.ics";
            if (groupName && shiftName) fileName = groupName + "_" + shiftName + "_" + "calendar.ics";
            else if (groupName) fileName = groupName + "_" + "calendar.ics";
            response.setHeader("Content-Disposition", "inline; filename=" + fileName);
        } catch (e) {
            response.setStatus(404);
        }
    } else
        response.setStatus(400);
})(request, response);
