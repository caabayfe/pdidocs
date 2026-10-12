var CloneAuthAPI = Class.create();
var CLONE_TOKEN_TABLE = "clone_token";
var NOT_CAPABLE = "not_capable";

var _getDBParams = function(request, responseBody) {
    var requestExcludeJdbc = !gs.nil(request.exclude_jdbc_params) && request.exclude_jdbc_params == 'true';
    var globalExcludeJdbc = gs.getProperty("glide.db.clone.ha_get_params_ws.exclude_jdbc_params", 'false') == 'true';
    var includeJdbcParams = !requestExcludeJdbc && !globalExcludeJdbc;

    if (includeJdbcParams) {
        var parms = GlideDBUtil.getPrimaryDBConfigurationParms();
        responseBody.name = parms.getDatabaseName();
        responseBody.user = parms.getUser();
        responseBody.rdbms = parms.getRDBMS();

        // for ease of development and testing in dev environments just use localhost (no sql permission; also IP address lookup takes 5s)
        var primaryIP = GlideUtil.isDeveloperInstance() ? "localhost" : GlideHostUtil.getPublicIPAddress();
        responseBody.ip = primaryIP;

        var dbUrl = parms.getURL().replace("//localhost", "//" + primaryIP);
        responseBody.url = dbUrl;

        responseBody.password = ""; // this is no longer in use by caller

        var ts = parms.getTableSpaceName();
        if (ts == null)
            ts = "";

        responseBody.tablespace = ts;
    }
};

CloneAuthAPI.prototype = {
    initialize: function() {},

    haGetParams: function(request, response) {
        var responseBody = {};
        var skipEKMSCheck = false;
        try {
            var _clone_id = request.queryParams.clone_id || '',
                clone_id;
            if (_clone_id || JSUtil.notNil(_clone_id))
                clone_id = _clone_id.toString();
            if ('false' == gs.getProperty("glide.db.clone.allow_clone_target", 'true'))
                throw this._buildThrowObject(500, "Internal server error", "Destination does not allow clone requests (Typically used by live production instances, a property was set that prevents the instance from being cloned over).");

            _getDBParams(request, responseBody);
            responseBody.war_version = gs.getProperty("glide.war");
            responseBody.instance_id = gs.getProperty("instance_id");
            responseBody.clone_id = clone_id;
            responseBody.production = GlideUtil.isProductionInstance();
            responseBody.security_token = this._createCloneToken(clone_id) || "";
            try {
                skipEKMSCheck = JSON.parse(gs.getProperty("com.snc.ha.skipCloneEKMSCheck"));
            } catch (e) {
                gs.error("com.snc.ha.skipCloneEKMSCheck: Property not found, continuing with EKMS Check" + e);
            }
            if (!skipEKMSCheck) responseBody.ekms_stats = this._getEKMSStatus();
            responseBody.status = 'success';
            response.setStatus(200);
            response.setBody(responseBody);
        } catch (e) {
            response.setError(this._buildError((e.code || 500), (e.code ? e.message : 'Internal server error'), (e.code ? e.detail : e.message)));
        }
    },
	
    /**
     * Provide EKMS Status from the EKMS API
     *
     * @returns {Object} EKMS Status JSON
     */
    _getEKMSStatus: function() {
        // Check EKMS capabilities from xmlstats.do 
        try {
            var ekms_capable = global.SystemCloneWrapper.checkEKMSXMLStats();
        } catch (e) {
            return {
                status: "ERROR_XMLStats"
            };
        }
        if (!ekms_capable) {
            return {
                status: NOT_CAPABLE
            };
        }
        // Call the EKMS API
        try {
            var ekmsStats = new global.EKMSApi().getStats();
            var stats = JSON.parse(ekmsStats);
        } catch (e) {
            return {
                status: "ERROR_EKMSApi"
            };
        }
        return stats;
    },
	
    _buildThrowObject: function(code, message, detail) {
        return {
            code: code || 500,
            message: message || 'Internal server error',
            detail: detail || ''
        };
    },

    _buildError: function(errorCode, message, detail) {
        var _err = new sn_ws_err.ServiceError();
        _err.setStatus(errorCode);
        _err.setMessage(message);
        _err.setDetail(detail);
        return _err;
    },

    _createCloneToken: function(clone_id) {
        if (gs.nil(clone_id) || JSUtil.nil(clone_id))
            return '';

        var tokenGR = new GlideRecord(CLONE_TOKEN_TABLE);
        if (!tokenGR.isValid())
            throw this._buildThrowObject(500, "Internal server error", "Clone token table is not found!");
        tokenGR.initialize();
        tokenGR.clone_id = clone_id;
        var tokenId = GlideSecureRandomUtil.getSecureRandomString(40);
        tokenGR.security_token = tokenId;
        if (tokenGR.insert())
            return tokenId;
    },

    type: 'CloneAuthAPI'
};
