(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var ROLES_WITH_ACCESS = ["admin", "sn_aia.admin", "sn_skill_builder.admin"];
    try {
        var hasRoleCheck = ROLES_WITH_ACCESS.some(role => gs.hasRole(role));
        if (!hasRoleCheck) {
            gs.error("User " + gs.getUserName() + " does not have access to generate Prism OAuth tokens");
            response.setStatus(403);
            response.setBody({error: "Access denied for user " + gs.getUserName() + " User does not have permission."});
            return;
        }
        var reqJson = JSON.parse(request.body.dataString);
        var services = reqJson.services || [];
        var nextWaveRequested = services.some(service => String(service).toLowerCase() === "nextwave");

        if (nextWaveRequested) {
            // "nextwave" isn't a PrismScriptObject-recognized service - strip it before delegating.
            // It only ever produces the standalone NextWave token below.
            services = services.filter(service => String(service).toLowerCase() !== "nextwave");
        }

        reqJson.services = services;
        var resp = reqJson.services.length ? sn_one_extend.PrismScriptObject.getOAuthTokens(reqJson) : {};

        if (nextWaveRequested) {
            // Cache by conversationId so repeated calls for the same conversation reuse an
            // unexpired token; falls back to null (fresh, uncached token) when there's none.
            var tokenKey = reqJson.conversationId || null;
            var jwtToken = sn_cs_offglide.OffGlideScriptObject.generateChannelsNextWaveToken(tokenKey);
            if (jwtToken) {
                resp.nextwave = {
                    jwtToken: jwtToken,
                    requestId: reqJson.requestId
                };
            } else {
                gs.error("Failed to generate NextWave token for requestId=" + reqJson.requestId);
            }
        }

        response.setBody(resp);
    } catch (e) {
        //todo: return error information
        gs.error("Prism token refresh exception=" + e);
        response.setStatus(500);
    }

})(request, response);
