var RoleSyncer = Class.create();
RoleSyncer.prototype = {
    initialize: function(instanceName, licenseRoleDiscoveryService, licenseDownloaderUtils) {
        this.instanceName = instanceName ? instanceName : gs.getProperty("instance_name");
        this.licenseRoleDiscoveryService = new LicenseRoleDiscoveryService();
        this.entitlementEngineUtils = new sn_lef.EntitlementEngineUtils();
        this.licenseInfoDownloader = new sn_lef.LicenseInfoDownloader();
        this.licenseDownloaderUtils = new LicensingDownloaderUtils();
        this.logger = new LoggingUtil();
        this.isRoleSyncEnforced = gs.getProperty("sn_entitlement.role_sync.enforced", "false") === "true";
        this.uaInstanceStateDAO = new UAInstanceStateDAO();
    },

    /**
     * Upload discovered roles to central instance and download rationalized roles information to license_role
     */
    syncRoles: function() {
        if (this.uaInstanceStateDAO.isProductionInstance() || this.isRoleSyncEnforced) {
            const payload = this._generatePayload();
            const response = this._send(payload);
            this._process(response);
            this.logger.logInfo(this.type, "syncRoles", "Done with updateLicenseRole.");
        } else {
            this.logger.logInfo(this.type, "syncRoles", "Skip updateLicenseRole on subprod.");
        }
        // this should ideally be returned by the above, but while the entire set of downloads are reworked
        // call existing download separately
        this._download();
    },

    /**
     * Generate payload to upload discovered role information 
     * @returns {object} payload of the form
     * [
     *   {
     *     "instance_name": "ash_instance",
     *     "role_name": "x_snc_ash_app.ash_role",
     *     "custom": "true",
     *     "previous": [
     *       {
     *         "application": "ai_search",
     *         "role_type": "fulfiller",
     *         "scope": "global"
     *       },
     *       ...
     *     ],
     *     "changed": [
     *       {
     *         "application": "ai_search",
     *         "role_type": "fulfiller",
     *         "scope": "global"
     *       },
     *       ...
     *      ]
     *   },
     *   ...
     * ]
     */
    _generatePayload: function() {
        const payload = [];
        for (const [roleName, [previous, changed]] of this.licenseRoleDiscoveryService.fetchChangedRoleData())
            payload.push(this._generatePayloadForRole(roleName, previous, changed));
        return payload;
    },

    _generatePayloadForRole: function(roleName, previous, changed) {
        const toRoleData = roleData => ({'role_type': roleData.roleType, 'application': roleData.application, 'scope': roleData.scope, 'reason': roleData.reason});
        return {
            'instance_name' : this.instanceName,
            'role_name' : roleName,
            'version' : this._getEntitlementAppVersion(),
            'custom': this._isCustom(previous, changed),
            'previous' : previous.map(toRoleData),
            'changed' : changed.map(toRoleData)
        };
    },

    _getEntitlementAppVersion: function() {
        const gr = new GlideRecord("sys_store_app");
        if (gr.get("scope", LicensingEngineConstants.ENTITLEMENT_APP_SCOPE))
            return gr.getValue("version");
        return "";
    },

    _isCustom: function(previous, changed) {
        if (previous.length > 0)
            return previous[0].isCustom;
        return changed[0].isCustom;
    },

    _send: function(payload) {
        const endPointURL = "/api/now/ualicensingservice/updateLicenseRole";
        const restMethod = "POST";

        const authorization = this.entitlementEngineUtils.getAuthHeader();
        const header = {
            'Authorization': authorization,
            'Accept': "application/json",
            'Content-Type': 'application/json'
        };
        const restObject = {
            'end_point': endPointURL,
            'rest_method': restMethod,
            'headers': header,
            'request_body': JSON.stringify(payload)
        };
        return this.licenseDownloaderUtils.executeRESTAPI(restObject);
    },

    /**
     * Process the response from discovered role upload endpoint
     * @param {object} result - response body expected in this format
     * {
     *   result: [
     *     {
     *       'role_name' : 'roleA',
     *       'status' : 'success',
     *       'message': 'nothing to say'
     *     },
     *     {
     *       'role_name' : 'roleB',
     *       'status' : 'error',
     *       'message': 'there be overrides'
     *     } 
     *   ]
     * }
     */
    _process: function(response) {
        const statusCode = response.getStatusCode();
        if (statusCode < 200 || statusCode >= 300) {
            this.logger.logError(this.type, "upload", `Failed with status code ${response.getStatusCode()} due to ${response.getErrorCode()} - ${response.getErrorMessage()}`);

            this.licenseRoleDiscoveryService.applyRoleDataChangesAsError();
            return;
        }
        const {result} = JSON.parse(response.getBody());
        result.forEach(roleResult => this._processRole(roleResult));
    },

    _processRole: function(roleResult) {
        this.logger.logInfo(this.type, '_processRole', `Applying changes to role ${roleResult.role_name} status ${roleResult.status} with message ${roleResult.message}`);
        this.licenseRoleDiscoveryService.applyRoleDataChanges(roleResult.role_name, roleResult.status === 'success');
    },

    /**
     * Call existing java code to download role information into license_role
     */
    _download: function() {
        this.licenseInfoDownloader.downloadRoles();
    },

    type: 'RoleSyncer'
};
