var AppEntitlementProcessor = Class.create();
AppEntitlementProcessor.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
    },

    // returns true if license check required attribute for the given app_id is set to true, else returns false
    isLicenseCheckRequired: function(appId) {
        try {
            var licenseCheckRequired = new UAAppFamilyDAO().isLicenseCheckRequiredForApp(appId);
            if (gs.nil(licenseCheckRequired))
                return false;
            if (LicensingEngineConstants.TRUE_ONE.equals(licenseCheckRequired) || LicensingEngineConstants.TRUE.equals(licenseCheckRequired))
                return true;
            if (this.logger.isEntitlementLoggingEnabled()) {
                this.logger.logInfo(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED,
                    LicensingEngineConstants.LICENSE_CHECK_IS_NOT_REQUIRED.concat(LicensingEngineConstants.COLON).concat(appId));
            }

            return false;
        } catch (error) {
            const errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.LICENSE_CHECK_REQUIRED_FAILED] + appId + error + " \n " + error.stack;
            this.logger.logError(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.LICENSE_CHECK_REQUIRED_FAILED, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
            return false;
        }
    },

    /**
     * returns true if the instance is entitled to the given app_id, else returns false
     * For fixing DEF0625850 - modified as below
     * deepCheck=true is equivalent to hasLicenseForFeature in Smv1
     * deepCheck=false is equivalent to hasLicenseForApp in Smv1
     */
    isEntitled: function(appId, deepCheck) {
        try {
            // should only execute for the hasLicenseForFeature API
            if (deepCheck && !this.doesAppExist(appId)) {
                // if the given app_id doesn't have a record in ua_app_family, then it is not a valid app_id for performing entitlement checks
                if (this.logger.isEntitlementLoggingEnabled()) {
                    this.logger.logInfo(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED,
                        LicensingEngineConstants.APP_DOES_NOT_EXIST.concat(LicensingEngineConstants.COLON).concat(appId));
                }
                return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
            }
            // should only execute for hasLicenseForFeature API
            if (deepCheck && !this.isLicenseCheckRequired(appId))
                return true;

            const familyIds = new UAAppFamilyDAO().getFamilyListOfApp(appId);
            const isLicensable = new SubscriptionHasFamilyDAO().getLicensableStateForFamily(familyIds);
            // Check explicit entitlement for app - if family is not installable no need to perform further check for app.
            if (!isLicensable)
                return false;
            if (!new SubscriptionHasAppDAO().isAppEntitled(appId)) {
                let errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_APP_ENTITLEMENT] + appId;

                if (this.logger.isEntitlementLoggingEnabled()) {
                    this.logger.logErrorWithoutAudit(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg);
                }
                return false;
            }
            return true;
        } catch (error) {
            errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_APP_ENTITLEMENT] + appId + error + " \n " + error.stack;
            this.logger.logError(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_APP_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);

            return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
        }
    },

    // returns the license details for the appId
    getLicenseDetailsForArtifact: function(appId) {
        var entitlementBO = new EntitlementBO();
        try {
            var entitlementIds = this.getActiveSubscriptions(appId);
            var prodInstNames = new SubscriptionEntitlementDAO().getProdInstNamesByEntitlementIds(entitlementIds);

            var isLicenseCheckRequired = false;
            var licenseCheckRequired = new UAAppFamilyDAO().isLicenseCheckRequiredForApp(appId);
            if (gs.nil(licenseCheckRequired)) {
                isLicenseCheckRequired = true;
            } else {
                isLicenseCheckRequired = LicensingEngineConstants.TRUE_ONE.equals(licenseCheckRequired) || LicensingEngineConstants.TRUE.equals(licenseCheckRequired);
            }

            var isEntitled = !isLicenseCheckRequired ? true : entitlementIds.length > 0;
            var isPermitted = !new GlideEntitlementAPI().isInstanceLicenseAware() ? true : isEntitled;

            entitlementBO.setIsEntitled(isEntitled);
            entitlementBO.setIsPermitted(isPermitted);
            entitlementBO.setProductionInstanceNames(prodInstNames);

            return entitlementBO;
        } catch (error) {
            this.logger.logErrorInDetermining(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT,
                LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_APP, error);

            return entitlementBO;
        }
    },

    // Returns the map of app with associated production instance, state of entitlement and permitted for the given app id list.
    getLicenseDetailsForArtifacts: function(appIdList) {
        let appEntitlementBOMap = {};
        let responseMap;
        let entitlementBO = {};
        try {
            let appSubscriptionMap = new SubscriptionHasAppDAO().getActiveSubscriptionMapForApps(appIdList);
            const isPermitted = new InstanceInfoUtil().isOpenInstance();
            let prodInstNames;
            for (let key in appSubscriptionMap) {
                entitlementBO = Object.create(LicensingEngineConstants.entitlementBO);
                entitlementBO['isEntitled'] = false;
                entitlementBO['isPermitted'] = isPermitted;

                if (!gs.nil(appSubscriptionMap[key])) {
                    prodInstNames = new SubscriptionEntitlementDAO().getProdInstNamesByEntitlementIds(appSubscriptionMap[key]);
                    entitlementBO['productionInstanceNames'] = prodInstNames;
                } else {
                    this.logger.logCouldNotFind(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT_LIST,
                        LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS + key);
                }
                appEntitlementBOMap[key] = entitlementBO;
            }
            appEntitlementBOMap = new UAAppFamilyDAO().getAppToEntitlmentMap(appIdList, appEntitlementBOMap, appSubscriptionMap);
            responseMap = JSON.stringify(appEntitlementBOMap);
            this.logger.logInfo(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT_LIST,
                responseMap);
        } catch (error) {
            this.logger.logErrorInDetermining(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT_LIST,
                LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_APP_LIST + appIdList, error);


        }
        return responseMap;
    },

    // returns all the entitlement ids of the subscriptions that are active and associated with the given app
    getActiveSubscriptions: function(appId) {
        return new SubscriptionHasAppDAO().getActiveSubscriptionsForApp(appId);
    },

    // returns user access check type for the given app_id
    getUserAccessCheckType: function(appId) {
        try {
            var subscriptionEntIds = this.getActiveSubscriptions(appId);
            if (subscriptionEntIds.length == 0) {
                this.logger.logCouldNotFind(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.GET_USER_ACCESS_CHECK_TYPE,
                    LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS);
                return LicensingEngineConstants.CHECK;
            }

            var subscriptionTypes = new SubscriptionEntitlementDAO().getSubscriptionTypesByEntIds(subscriptionEntIds);
            return new UserAccessManagerUtil().getUserAccessCheckBySubscriptionTypes(subscriptionTypes);
        } catch (error) {
            this.logger.logErrorInDetermining(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR,
                LicensingEngineConstants.GET_USER_ACCESS_CHECK_TYPE, LicensingEngineConstants.USER_ACCESS_CHECK_TYPE, error);
            // if we catch any unexpected exception, we return true as we don't want to restrict customers
            return LicensingEngineConstants.ALLOW;
        }
    },



    doesAppExist: function(appId) {
        return new UAAppFamilyDAO().doesAppExist(appId);
    },

    // returns true if user is entitled for the input role and given appId
    isUserEntitledForRole: function(userId, role, appId) {
        try {
            if (!this.doesAppExist(appId)) {
                // if the given app_id doesn't have a record in ua_app_family, then it is not a valid app_id for performing entitlement checks
                this.logger.logInfo(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE,
                    LicensingEngineConstants.APP_DOES_NOT_EXIST.concat(LicensingEngineConstants.COLON).concat(appId));
                return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
            }

            if (!this.isLicenseCheckRequired(appId))
                return true;

            var highPrivilegeRoleList = new LicenseRoleTypeDAO().getRoleTypesWithEqualOrHighPrivileges(role);
            var subscriptionEntIds = this.getActiveSubscriptions(appId);
            if (subscriptionEntIds.length == 0)
                this.logger.logCouldNotFind(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE,
                    LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS);

            for (var i in subscriptionEntIds) {
                var subscriptionRoleTypeSysIds = new SubscriptionEntitlementDAO().getMeasuredRoleTypesByEntId(subscriptionEntIds[i]);
                var arrayUtil = new global.LicensingScriptUtil();
                var intersectedArray = arrayUtil.intersect(highPrivilegeRoleList, subscriptionRoleTypeSysIds);
                if (intersectedArray.length == 0)
                    continue;

                if (new UserHasSubscriptionDAO().doesUserHasSubscriptionByEntId(userId, subscriptionEntIds[i]))
                    return true;

                var userGroups = new SysUserGrmemberDAO().getUserGroups(userId);
                if (new GroupHasSubscriptionDAO().doesGroupsHaveSubscriptionByEntId(userGroups, subscriptionEntIds[i]))
                    return true;
            }
            if (this.logger.isEntitlementLoggingEnabled()) {
                var errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT] + " user Id : " + userId + " appId : " + appId + " role : " + role;
                this.logger.logError(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
            }

            return false;
        } catch (error) {
            errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT] + " user Id : " + userId + " appId : " + appId + " role : " + role + error + " \n " + error.stack;
            this.logger.logError(LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_USER_ROLE_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);


            return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
        }
    },


    getActiveSubscriptionSysIds: function(appId) {
        return new SubscriptionHasAppDAO().getActiveSubscriptionSysIdsForApp(appId);
    },

    type: 'AppEntitlementProcessor'
};
