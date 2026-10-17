var ExplicitEntitlementBuilder = Class.create();
ExplicitEntitlementBuilder.prototype = {
    initialize: function() {
        this.arrayUtil = new global.LicensingScriptUtil();
        this.INSTALLATION_STATUS = {
            0: false,
            1: true
        };
    },

    getExplicitEntitlements: function(explicitEntitlement, entitlementModelName) {
        var explicitEntitlementsMap = {};
        if (global.LicensingScriptUtil.nil(explicitEntitlement) || global.LicensingScriptUtil.isEmpty(explicitEntitlement) || global.LicensingScriptUtil.nil(entitlementModelName))
            return explicitEntitlementsMap;

        if (this.arrayUtil.contains(LicensingEngineConstants.SUBSCRIPTION_TYPE_MODEL_NAMES, entitlementModelName))
            explicitEntitlementsMap = this.getExplicitEntitlementsFromSubscription(explicitEntitlement);

        return explicitEntitlementsMap;
    },

    /**
     * retrieves explicit entitlement details from transformed subscription product data
     */
    getExplicitEntitlementsFromSubscription: function(explicitEntitlement) {
        let explicitEntitlementsMap = {};
        if (global.LicensingScriptUtil.nil(explicitEntitlement) || global.LicensingScriptUtil.isEmpty(explicitEntitlement))
            return explicitEntitlementsMap;

        explicitEntitlement = this._extractChildFamily(explicitEntitlement);

        for (var i = 0; i < explicitEntitlement.length; i++) {
            const explicitEntitlementFamilyObj = explicitEntitlement[i];
            const key = explicitEntitlementFamilyObj[LicensingEngineDBConstants.UNIQUE_KEY];

            if (global.LicensingScriptUtil.nil(key))
                continue;

            const product_code = explicitEntitlementFamilyObj[LicensingEngineDBConstants.PRODUCT_CODE];
			const installable = this._extractInstallableState(explicitEntitlementFamilyObj[LicensingEngineDBConstants.INSTALLABLE]);
            const roleTypes = explicitEntitlementFamilyObj[LicensingEngineDBConstants.ROLE_TYPE];
            const entitled_role_types = this._getRoleTypeList(roleTypes, LicensingEngineConstants.LICENSED);
            const unrestricted_role_types = this._getRoleTypeList(roleTypes, LicensingEngineConstants.UNRESTRICTED);

            explicitEntitlementsMap[key] = {
                [LicensingEngineDBConstants.PRODUCT_CODE]: product_code,
                [LicensingEngineDBConstants.ENTITLED_ROLE_TYPES]: entitled_role_types,
                [LicensingEngineDBConstants.UNRESTRICTED_ROLE_TYPES]: unrestricted_role_types,
                [LicensingEngineDBConstants.INSTALLABLE]: installable
            };
        }

        return explicitEntitlementsMap;
    },

    /*
     * extract the child family details and create a flattened array.
     * currently expecting to have nesting upto 2 level.
     * this can be enhanced to support n-tier parent-child hierarchy in the future.
     */
    _extractChildFamily: function(data, result = []) {
        data.forEach(item => {
            if (item[LicensingEngineDBConstants.CHILD])
                this._extractChildFamily(item[LicensingEngineDBConstants.CHILD], result);

            result.push(item);
        });
        return result;
    },

    _getRoleTypeList: function(roleTypes, expectedRoleCategory) {
        if (global.LicensingScriptUtil.nil(roleTypes) || global.LicensingScriptUtil.nil(expectedRoleCategory))
            return [];

        let roleTypeList = [];
        roleTypes.forEach(roleType => {
            Object.entries(roleType).forEach(([key, value]) => {
                if (value.toLowerCase() == expectedRoleCategory.toLowerCase() && roleTypeList.indexOf(key) < 0)
                    roleTypeList.push(key);

            });
        });
        return roleTypeList;
    },

    _extractInstallableState: function(installableString) {
        let install = "";
        try {
            //we are expecting this in json.stringify format from transformer
            install = JSON.parse(installableString);
        } catch (error) {}

        return this.getInstallableStatus(this.INSTALLATION_STATUS[install]);
    },
    /**
     * default value for installable is true (can install)
     * Truth Table
     * -----------------------------------
     * 0                        =   false
     * 1                        =   true
     * false                    =   false
     * true                     =   true
     * undefined                =   true
     * -----------------------------------
     * true         undefined   =   true
     * undefined    true        =   true
     * false        undefined   =   true
     * undefined    false       =   true
     * undefined    undefined   =   true
     * -----------------------------------
     * true         true        =   true
     * true         false       =   true
     * false        true        =   true
     * false        false       =   false
     *
     * @param {array} a list of arguments each representing installation status
     *
     * @returns {boolean} installation status calculated based on the above truth table
     */
    getInstallableStatus: function() {
        if (!arguments.length)
            return false;

        let installable = false;
        for (let i = 0; i < arguments.length; i++) {
            if (global.LicensingScriptUtil.nil(arguments[i]) || global.LicensingScriptUtil.toBoolean(arguments[i])) {
                installable = true;
                break;
            }
        }

        return installable;
    },
    /**
     * Maintain a list of unique role types
     * @param {array<array>} a list of arguments each representing a list of role types
     *
     * @returns {array} unique list og consolidated role types
     */
    getUniqueRoleTypes: function() {
        if (!arguments.length)
            return [];

        let roleTypes = [];
        for (let i = 0; i < arguments.length; i++) {
            if (global.LicensingScriptUtil.notNil(arguments[i]) && !global.LicensingScriptUtil.isEmpty(arguments[i]))
                roleTypes = this.arrayUtil.union(roleTypes, arguments[i]);

        }

        return roleTypes;
    },

    type: 'ExplicitEntitlementBuilder'
};
