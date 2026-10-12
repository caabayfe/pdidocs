var CustomTableEntitlementProcessor = Class.create();
CustomTableEntitlementProcessor.prototype = {
    initialize: function() {
        this.ctiDao = new CustomTableInventoryDAO();
        this.logger = new LoggingUtil();
    },

    // returns true if table is present in sys_custom_db_object
    isCustomTable: function(tableName) {
        return new SysCustomDBObjectDAO().isCustomTable(tableName);
    },

    // returns true if table is present in CTI and allotment type is not grandfather
    isLicensableCustomTable: function(tableName) {
        return this.ctiDao.isLicensableCustomTable(tableName);
    },

    // returns sys_id of the active subscription associated with the given custom table
    getActiveSubscriptionSysId: function(tableName) {
        return this.ctiDao.getActiveSubscriptionSysId(tableName);
    },

    // returns user access check type associated with the given custom table
    getUserAccessCheckType: function(tableName) {
        try {
            var subscriptionSysId = this.getActiveSubscriptionSysId(tableName);
            if (gs.nil(subscriptionSysId)) {
                this.logger.logCouldNotFind(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.GET_USER_ACCESS_CHECK_TYPE,
                    LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS);
                return LicensingEngineConstants.CHECK;
            }

            var subscriptionType = new SubscriptionEntitlementDAO().getSubscriptionTypeBySysId(subscriptionSysId);
            if (gs.nil(subscriptionType)) {
                this.this.logger.logCouldNotFind(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.GET_USER_ACCESS_CHECK_TYPE,
                    LicensingEngineConstants.ASSOCIATED_SUBSCRIPTION_TYPE);
                return LicensingEngineConstants.CHECK;
            }
            return new UserAccessManagerUtil().getUserAccessCheckBySubscriptionType(subscriptionType);
        } catch (error) {
            this.logger.logErrorInDetermining(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR,
                LicensingEngineConstants.GET_USER_ACCESS_CHECK_TYPE, LicensingEngineConstants.USER_ACCESS_CHECK_TYPE, error);
            // if we catch any unexpected exception, we return true as we don't want to restrict customers
            return LicensingEngineConstants.ALLOW;
        }
    },

    // returns true if table is present in CTI amd is non-gf table
    isLicenseCheckRequired: function(tableName) {
        var licenseCheckRequired = this.isLicensableCustomTable(tableName);
        if (!licenseCheckRequired)
            this.logger.logInfo(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED,
                LicensingEngineConstants.LICENSE_CHECK_IS_NOT_REQUIRED);

        return licenseCheckRequired;
    },

    // returns true if user is entitled to perform given role on the table
    isUserEntitledForRole: function(userId, role, tableName) {
        try {
            if (!this.isLicenseCheckRequired(tableName))
                return true;

            var highPrivilegeRoleList = new LicenseRoleTypeDAO().getRoleTypesWithEqualOrHighPrivileges(role);
            var subscriptionSysId = this.getActiveSubscriptionSysId(tableName);
            if (!gs.nil(subscriptionSysId)) {
                var subscriptionRoleTypeSysIds = new SubscriptionEntitlementDAO().getMeasuredRoleTypesBySysId(subscriptionSysId);
                var arrayUtil = new global.LicensingScriptUtil();
                var intersectedArray = arrayUtil.intersect(highPrivilegeRoleList, subscriptionRoleTypeSysIds);
                if (intersectedArray.length == 0)
                    return false;

                if (new UserHasSubscriptionDAO().doesUserHasSubscription(userId, subscriptionSysId))
                    return true;

                var userGroups = new SysUserGrmemberDAO().getUserGroups(userId);
                if (new GroupHasSubscriptionDAO().doesGroupsHaveSubscription(userGroups, subscriptionSysId))
                    return true;
            } else
                this.logger.logCouldNotFind(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE,
                    LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS);

            if (this.logger.isEntitlementLoggingEnabled()) {
                var errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT] + " user Id : " + userId + " tableName : " + tableName + " role : " + role;
                this.logger.logError(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
            }

            return false;
        } catch (error) {
            errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT] + " user Id : " + userId + " tableName : " + tableName + " role : " + role + error + " \n " + error.stack;
            this.logger.logError(LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);

            return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
        }
    },

    type: 'CustomTableEntitlementProcessor'
};
