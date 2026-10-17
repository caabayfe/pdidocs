var UserAccessManagerUtil = Class.create();
UserAccessManagerUtil.prototype = {
    initialize: function() {},

    // returns user access check type from multiple subscription types
    // It returns check type on basis of priority order ALLOW > CHECK > DISMISS
    getUserAccessCheckBySubscriptionTypes: function(subscriptionTypes) {
        var userAccessCheckType = {
            'ALLOW': false,
            'CHECK': false,
            'DISMISS': false
        };

        for (var i in subscriptionTypes) {
            var accessCheckType = this.getUserAccessCheckBySubscriptionType(subscriptionTypes[i]);
            userAccessCheckType[accessCheckType] = true;
        }
        if (userAccessCheckType[LicensingEngineConstants.ALLOW])
            return LicensingEngineConstants.ALLOW;

        if (userAccessCheckType[LicensingEngineConstants.CHECK])
            return LicensingEngineConstants.CHECK;

        if (userAccessCheckType[LicensingEngineConstants.DISMISS])
            return LicensingEngineConstants.DISMISS;

        return LicensingEngineConstants.ALLOW;
    },

    // returns user access check type for a single subscription type
    getUserAccessCheckBySubscriptionType: function(subscriptionType) {
        var accessCheckType = this.getOverriddenUserCheckBySubscriptionType(subscriptionType);
        if (gs.nil(accessCheckType))
            accessCheckType = this.getDefaultAccessCheckType(subscriptionType);

        return accessCheckType;
    },

    /* Following properties will be used on the basis of enforce mode accordingly:
     * OFF MODE: com.glide.entitlement.off.user_type_allowed, com.glide.entitlement.off.user_type_checked, com.glide.entitlement.off.user_type_dismissed
     * ENFORCE MODE: com.glide.entitlement.user_type_allowed, com.glide.entitlement.user_type_checked, com.glide.entitlement.user_type_dismissed
     */
    getOverriddenUserCheckBySubscriptionType: function(subscriptionType) {
        var propPrefix = this.isEnforceModeOff() ? LicensingEngineConstants.PROPERTY_PREFIX_OFF_MODE : LicensingEngineConstants.PROPERTY_PREFIX;
        var userAccessCheckTypes = [LicensingEngineConstants.ALLOW, LicensingEngineConstants.CHECK, LicensingEngineConstants.DISMISS];
        for (var i in userAccessCheckTypes) {
            var propSuffix = LicensingEngineConstants.USER_TYPE_.concat(userAccessCheckTypes[i].toLowerCase()).concat(LicensingEngineConstants.SUFFIX_ED);
            var property = propPrefix + LicensingEngineConstants.DOT + propSuffix;
            var subscriptionTypesList = new SysPropertiesDAO().getProperty(property);
            if (!gs.nil(subscriptionTypesList) && subscriptionTypesList.indexOf(subscriptionType) > -1)
                return userAccessCheckTypes[i];
        }
        return null;
    },

    getDefaultAccessCheckType: function(subscriptionType) {
        switch (subscriptionType) {
            case LicensingEngineConstants.PER_USER_LICENSE:
                return LicensingEngineConstants.CHECK;
            case LicensingEngineConstants.MAX_USER_LICENSE:
                return this.isEnforceModeOff() ? LicensingEngineConstants.ALLOW : LicensingEngineConstants.CHECK;
            case LicensingEngineConstants.UNLIMITED_USER_LICENSE:
                return LicensingEngineConstants.ALLOW;
            case LicensingEngineConstants.CAPACITY_LICENSE:
                return LicensingEngineConstants.ALLOW;
            case LicensingEngineConstants.DISPLAY_LICENSE:
                return LicensingEngineConstants.ALLOW;
            case LicensingEngineConstants.PA_INDICATOR_LICENSE:
                return LicensingEngineConstants.DISMISS;
            default:
                return LicensingEngineConstants.ALLOW;
        }
    },

    getEnforceMode: function() {
        var propertyDAO = new SysPropertiesDAO();
        var globalProperty = propertyDAO.getGlobalEntitlementEnforceMode();
        if (new InstanceInfoUtil().isOpenInstance())
            return (gs.nil(globalProperty)) ? this.getDefaultEnforceMode() : globalProperty;

        var systemDefaultMode = this.getDefaultEnforceMode();
        if (gs.nil(globalProperty))
            globalProperty = systemDefaultMode;

        var overrideProperty = propertyDAO.getOverrideEntitlementEnforceMode();
        return (!gs.nil(overrideProperty) && !LicensingEngineConstants.ENFORCE_MODE_DEFAULT.equals(overrideProperty) && this.isEnforceModeOverridable()) ? overrideProperty : globalProperty;
    },

    getDefaultEnforceMode: function() {
        return LicensingEngineConstants.ENFORCE_MODE_OFF;
    },

    isEnforceModeOff: function() {
        return LicensingEngineConstants.ENFORCE_MODE_OFF.equals(this.getEnforceMode());
    },

    isEnforceModeOverridable: function() {
        return new InstanceStateConfigDAO().isEnforceModeOverridable();
    },

    type: 'UserAccessManagerUtil'
};
