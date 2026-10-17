var GlideEntitlementAPI = Class.create();
GlideEntitlementAPI.prototype = {
    initialize: function() {
        this.entitlementService = new EntitlementService();
        this.requestValidator = new EntitlementRequestValidator();
        this.logger = new LoggingUtil();
        this.uaAppInfoDAO = new UAAppInfoDAO();
    },

    // returns true if license check is required for the given artifact
    isLicenseCheckRequired: function(artifactType, artifactId) {
        if (!this.requestValidator.isValidArtifactForLicenseCheck(artifactType, artifactId)) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED,
                LicensingEngineConstants.LICENSE_CHECK_REQUIRED);
            return false;
        }
        return this.entitlementService.isLicenseCheckRequiredForArtifact(artifactType, artifactId);
    },

    // returns true if instance is entitled to the given artifact
    // returns defaultResponse if the service layer is unable to find the artifact with the given artifact id
    // DEF0625850 - added deepCheckAppEntitlement with default as true, i.e. look up in ua_app_family table and licenseReqCheck.This flag is passed in with a false value when the hasLicenseForApp API is called, the reason is to make it backwards compatible with SMv1.
    hasLicenseForArtifact: function(artifactType, artifactId, defaultResponse, ignoreOpenCheck, deepCheckAppEntitlement = true) {
        if (!this.requestValidator.isValidArtifact(artifactType, artifactId)) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.HAS_LICENSE_FOR_ARTIFACT,
                LicensingEngineConstants.INSTANCE_HAS_LICENSE_FOR_ARTIFACT);
            return false;
        }
        // setting the default response to true if it is not defined as we do not want to restrict customers
        if (gs.nil(defaultResponse))
            defaultResponse = true;
        if (gs.nil(ignoreOpenCheck))
            ignoreOpenCheck = false;

        if (LicensingEngineConstants.APP_ID.equals(artifactType)) {
            var entitlementCheckOverride = this.uaAppInfoDAO.hasEntitlementCheckOverridenForApp(artifactId);
            if (entitlementCheckOverride === true)
                return true;
        }

        // For app_id artifacts: if the app is not allowed on customer subprod, ignore open instance check
        if (!ignoreOpenCheck && LicensingEngineConstants.APP_ID.equals(artifactType)) {
            var isAllowedOnCustomerSubprod = this.uaAppInfoDAO.isCustomerAllowedToInstallOnSubprod(artifactId);
            if (isAllowedOnCustomerSubprod === false)
                ignoreOpenCheck = true;
        }

        let resultResponse = this.entitlementService.isEntitledForArtifact(artifactType, artifactId, ignoreOpenCheck, deepCheckAppEntitlement);

        // exception handling for app_id will be done in later releases as enhancement, hence commented out for now
        // For app_id: if entitlement cannot be determined, treat as invalid app id and throw
        //if (LicensingEngineConstants.APP_ID.equals(artifactType) && LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT.equals(resultResponse))
        //    throw new Error("AppID : " + artifactId + " does not exist");

        return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT.equals(resultResponse) ? defaultResponse : resultResponse;
    },

    // returns true if the given instance should be aware of license/entitlement checks
    isInstanceLicenseAware: function() {
        var isOpenInstance = new InstanceInfoUtil().isOpenInstance();
        return !isOpenInstance;
    },

    isTableEntitledForArtifact: function(artifactType, artifactId, tableName, defaultResponse, ignoreOpenCheck) {
        if (!this.requestValidator.isValidArtifact(artifactType, artifactId)) {
            this.logger.logErrorWithoutAudit(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.TABLE_ENTITLEMENT_FOR_ARTIFACT,
                LicensingEngineConstants.INVALID_ARTIFACT_SPECIFIED + artifactType + " : " + artifactId);
            return false;
        }
        // setting the default response to true if it is not defined as we do not want to restrict customers
        if (gs.nil(defaultResponse))
            defaultResponse = true;
        if (gs.nil(ignoreOpenCheck))
            ignoreOpenCheck = false;
        let resultResponse = this.entitlementService.isTableLicensedForArtifact(artifactType, artifactId, tableName, ignoreOpenCheck);
        return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT.equals(resultResponse) ? defaultResponse : resultResponse;
    },


    entitlementExist: function(entitlementId) {
        return this.hasLicenseForArtifact(LicensingEngineConstants.FGE_ID, entitlementId);
    },

    // returns true if the given user can perform approval on the input table
    canUserApproveOnTable: function(userId, tableName, defaultResponse) {
        if (!this.requestValidator.isValidUser(userId))
            return false;

        var userSysId = new SysUserDAO().getUserSysId(userId);
        if (!this.requestValidator.isValidEntity(userSysId)) {
            this.logger.logInfo(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.CAN_USER_APPROVE_ON_TABLE,
                LicensingEngineConstants.INVALID_USER_SPECIFIED);
            return false;
        }
        if (!this.requestValidator.isValidEntity(tableName))
            return false;

        var tableInfo = this.entitlementService.getTableEntitlementInfo(tableName);
        if (!tableInfo.isUserEntitlementNeeded) {
            this.logger.logInfo(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.CAN_USER_APPROVE_ON_TABLE,
                LicensingEngineConstants.USER_ENTITLEMENT_IS_NOT_NEEDED);
            return true;
        }

        if (!this.requestValidator.isValidArtifactForUserEntitlements(tableInfo.artifactType, tableInfo.artifactId))
            return false;

        // setting the default response to true if it is not defined as we do not want to restrict customers
        if (gs.nil(defaultResponse))
            defaultResponse = true;

        // system will check if the user is entitled with the approver or any higher privileged roles
        let resultResponse = this.entitlementService.isUserEntitledForRoleOnArtifact(userSysId, LicensingEngineConstants.APPROVER,
            tableInfo.artifactType, tableInfo.artifactId);
        return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT.equals(resultResponse) ? defaultResponse : resultResponse;
    },



    getLicenseDetailsForArtifact: function(artifactType, artifactId) {
        var entitlementBO = new EntitlementBO();
        if (!this.requestValidator.isValidArtifactForLicenseDetails(artifactType, artifactId)) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT,
                LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_ARTIFACT);
            return entitlementBO;
        }
        return this.entitlementService.getLicenseDetailsForArtifact(artifactType, artifactId);
    },

    getLicenseDetailsForArtifacts: function(artifactType, artifactIdList) {
        if (!this.requestValidator.isValidArtifactForLicenseDetails(artifactType, artifactIdList)) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.GLIDE_ENTITLEMENT_API, LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT_LIST,
                LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_ARTIFACT);
            return JSON.stringify(Object.create(LicensingEngineConstants.entitlementBO));
        }
        return this.entitlementService.getLicenseDetailsForArtifacts(artifactType, artifactIdList);
    },

    type: 'GlideEntitlementAPI'
};
