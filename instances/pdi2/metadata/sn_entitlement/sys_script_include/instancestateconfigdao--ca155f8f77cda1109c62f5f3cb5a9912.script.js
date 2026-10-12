var InstanceStateConfigDAO = Class.create();
InstanceStateConfigDAO.prototype = {
    initialize: function() {},

    isEnforceModeOverridable: function() {
        var instStateConfig = new GlideRecord(LicensingEngineDBConstants.UA_INSTANCE_STATE_CONFIG);
        if (!instStateConfig.isValid())
            return false;

        instStateConfig.addQuery(LicensingEngineDBConstants.SETTING, LicensingEngineConstants.ENTITLEMENT_ENFORCEMENT_OVERRIDABLE);
        instStateConfig.query();
        if (instStateConfig.next()) {
            var isOverridable = instStateConfig.getValue(LicensingEngineDBConstants.VALUE);
            return LicensingEngineConstants.TRUE.equals(isOverridable) || LicensingEngineConstants.TRUE_ONE.equals(isOverridable);
        }
        return false;
    },

    type: 'InstanceStateConfigDAO'
};
