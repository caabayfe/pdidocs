var LicensingEngineCommonUtil = Class.create();
LicensingEngineCommonUtil.prototype = {
    initialize: function() {
        this._entitlementUtils = new sn_lef.EntitlementEngineUtils();
        this._instanceInfoUtil = new InstanceInfoUtil();
    },

    toLowerCase: function(value) {
        if (gs.nil(value))
            return "";

        return value.toLowerCase();
    },

    getDate: function(date) {
        if (date.length == 8)
            return date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6);

        return date;
    },

    getChoiceValue: function(field, choiceLabel) {
        const choices = {
            [LicensingEngineDBConstants.HOSTING_TYPE]: LicensingEngineConstants.HOSTING_TYPE_VALUE,
            [LicensingEngineDBConstants.STATUS]: LicensingEngineConstants.STATUS_VALUE
        };

        return choices[field][choiceLabel] || choices[field]["defaultValue"];
    },

    addSysUserActiveFilter(gr, dotWalkTo) {
        const prefix = dotWalkTo ? dotWalkTo + (dotWalkTo.endsWith(".") ? "" : ".") : "";
        gr.addQuery(prefix + 'active', true);
        gr.addNullQuery(prefix + 'web_service_access_only').addOrCondition(prefix + 'web_service_access_only', false); //null and false are equivalent but must be specified individually
        gr.addQuery(prefix + 'user_name', "!=", 'NULL');
        gr.addQuery(prefix + 'last_login_time', ">=", this.getDate365DaysAgo());
    },

    getDate365DaysAgo: function() {
        var gdOneYearAgo = new GlideDateTime(gs.daysAgo(365)).getLocalDate();
        return new GlideDateTime(gdOneYearAgo).toString();
    },

    shouldImportLicensingData: function() {
        return this.shouldImportLicensingDataAndReturnReason().shouldImport;
    },

    shouldImportLicensingDataAndReturnReason: function() {
        const CAN_IMPORT = {
            shouldImport: true
        };

        function canNotImport(msg) {
            return {
                shouldImport: false,
                reason: msg
            };
        }
        const emsProp = global.LicensingScriptUtil.toBoolean(this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_EMS_DATA_AVAILABLE));
        const surfProp = global.LicensingScriptUtil.toBoolean(this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_SURF_ROUTING));

        if (emsProp === false || surfProp === true)
            return canNotImport(LicensingEngineConstants.DONOT_IMPORT_REASONS.NOT_SMV2);

        if (this._instanceInfoUtil.isSelfHostedPropertySet())
            return CAN_IMPORT;

        if (this._instanceInfoUtil.isDeveloperInstance())
            return gs.hasRole('maint') ? CAN_IMPORT : canNotImport(LicensingEngineConstants.DONOT_IMPORT_REASONS.NOT_MAINT);
        else
            return canNotImport(LicensingEngineConstants.DONOT_IMPORT_REASONS.NOT_SELF_HOSTED);
    },

    processedSuccessfully: function() {
        return {
            success: true,
            message: "Payload has been processed successfully."
        }
    },

    processedWithFailure: function(msg) {
        return {
            success: false,
            message: msg
        }
    },

    isSelfHostedInstanceWithEntitlementSupport: function() {
        const hasSelfHostedInstanceSupport = sn_lef.SelfHostedInstanceAPIProcessor ? true : false;
        const isThisInstanceSelfHosted = new sn_entitlement.InstanceInfoUtil().isSelfHostedInstance();
        return hasSelfHostedInstanceSupport && isThisInstanceSelfHosted;
    },

    type: 'LicensingEngineCommonUtil'
};
