var DataPrivacySecurityUtil = Class.create();
DataPrivacySecurityUtil.prototype = {
    initialize: function() {},
    OPERATION_READ: "read",
    OPERATION_WRITE: "write",
    OPERATION_CREATE: "create",
    OPERATION_DELETE: "delete",
    /**
     * method to validate is current user is data privacy admin
     */
    isDataPrivacyAdmin: function() {
        return gs.hasRole(DataPrivacyConstants.DATA_PRIVACY_ADMIN);
    },
    /**
     * Method to validate if current user is data discovery admin
     */
    isDataDiscoveryAdmin: function() {
        return gs.hasRole(DataPrivacyConstants.DATA_DISCOVERY_ADMIN);
    },
    /**
     * Check if the current user has the necessary access rights to configure policies of a specified type within a given data channel.
     * @param dpChannelId sys_id of data channel
     * @param policyType string representing the type of policy (ex: discovery, anonymization)
     * 
     * @returns boolean True if current user has access to configure, false otherwise.
     */
    canConfigurePolicyType: function(dpChannelId, policyType) {
        var dpChannelGr = new GlideRecord(DataPrivacyConstants.TABLE_DP_CHANNEL);
        dpChannelGr.get(dpChannelId);
        if (!dpChannelGr.isValid() || !this._isValidPolicyType(policyType))
            return false;

        var allowedRoles = this.getAllowedRoles(dpChannelGr, policyType);
        return this._canAccessChannelConfigurationRecords(allowedRoles, policyType);
    },
    /**
     * Validate if the current user can select data patterns for a privacy advanced configuration based on policy type.
     * 
     * @param dpConfigGr GlideRecord of dp_configuration_domain_separated table.
     * 
     * @returns boolean True if user can select data patterns, false otherwise.
     */
    canSelectDataPatterns: function(dpConfigGr) {
        if (dpConfigGr.getTableName() != DataPrivacyConstants.TABLE_DP_CONFIGURATION_DOMAIN_SEPARATED || !dpConfigGr.isValid())
            return false;

        var policyType = dpConfigGr.policy_type.toString();

        if (!this._isValidPolicyType(policyType))
            return false;

        var allowedRoles = this.getAllowedRoles(dpConfigGr.channel, dpConfigGr.policy_type.toString());
        return this._canAccessChannelConfigurationRecords(allowedRoles, policyType);
    },
    /**
     * Check access of current user on performing CRUD operations on dp_configuration_domain_separated table
     * 
     * @param dpConfigGr GlideRecord of dp_configuration_domain_separated table.
     * @param operation indicates the operation being checked (create, read, write, delete)
     * 
     * @returns boolean True if user has access, false otherwise.
     */
    checkPrivacyConfigurationAccess: function(dpConfigGr, operation) {
        if (dpConfigGr.getTableName() != DataPrivacyConstants.TABLE_DP_CONFIGURATION_DOMAIN_SEPARATED || !dpConfigGr.isValid())
            return false;

        if (dpConfigGr.isNewRecord() || operation == this.OPERATION_CREATE)
            return this.canCreateChannelRecords();

        var policyType = dpConfigGr.policy_type.toString();

        if (!this._isValidPolicyType(policyType))
            return false;

        var allowedRoles = '';
        switch (operation) {
            case this.OPERATION_DELETE:
            case this.OPERATION_READ:
            case this.OPERATION_WRITE:
                allowedRoles = this.getAllowedRoles(current.channel, policyType);
                return this._canAccessChannelConfigurationRecords(allowedRoles, policyType);
            default:
                return false;
        }
    },
    /**
     * Check access of current user on performing read/write operations on dp_m2m_configuration_pattern table
     * 
     * @param dpConfigGr GlideRecord of dp_m2m_configuration_pattern table.
     * @param isReadOperation indicates if the operation is read
     * 
     * @returns boolean True if user has access, false otherwise.
     */
    checkConfigurationDataPatternsAccess: function(m2mConfigPatternGr, isReadOperation) {
        if (m2mConfigPatternGr.getTableName() != DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN || !m2mConfigPatternGr.isValid())
            return false;

        var defaultRoles = isReadOperation ? [DataPrivacyConstants.DATA_PRIVACY_ADMIN, DataPrivacyConstants.DATA_PRIVACY_AUDITOR] : [DataPrivacyConstants.DATA_PRIVACY_ADMIN];

        var allowedRoles = defaultRoles.join(',');

        if (current.config_table.toString() == DataPrivacyConstants.TABLE_DP_CONFIGURATION_DOMAIN_SEPARATED) {
            var policyType = m2mConfigPatternGr.config.policy_type.toString();

            if (!this._isValidPolicyType(policyType))
                return false;

            allowedRoles = this.getAllowedRoles(
                m2mConfigPatternGr.config.channel,
                policyType
            );
        }

        return this._canAccessChannelConfigurationRecords(allowedRoles, policyType);
    },
    /**
     * verifies if the given roles can access the data channel records
     * 
     * @param allowedRoles CSV of role names
     */
    canAccessChannelRecords: function(allowedRoles) {
        // data privacy admin and data discovery admin is always allowed
        if (this.isDataPrivacyAdmin() || this.isDataDiscoveryAdmin())
            return true;

        return this._roleHasAccess(allowedRoles);
    },

    /**
     * verifies if the given roles can access the data channel records
     * 
     * @param current GlideRecord of the current channel
     */
    canAccessChannelRecordsByArrayStr: function(current) {
        if (this.isDataPrivacyAdmin() || this.isDataDiscoveryAdmin())
            return true;

        var allowedRolesArray = this._getAllowedRolesForChannel(current);
        for (var i = 0; i < allowedRolesArray.length; i++) {
            if (this._roleHasAccess(allowedRolesArray[i])) {
                return true;
            }
        }
        return false;
    },

    /**
     * Used for Dynamic Filter for dp_configuration_advanced reference to dp_channel
     */
    canBeUsedInRegulatedInstance: function(current) {
        var dpChannelRegulatedInstance = current.regulated_instance;
        var isRegulatedInstance = gs.getProperty(DataPrivacyConstants.SYS_PROPERTY_REGULATED_INSTANCE, 'false');
        if (isRegulatedInstance == "true") {
            return "regulated_instance=" + isRegulatedInstance + "^active=true";
        }
        return "active=true";

    },

    /**
     * verifies if the current user can create channel based configurations
     * To do so the user must have atleast one of "allowed_roles" from dp_channel, or must be a data_privacy_admin
     */
    canCreateChannelRecords: function() {
        var allowedRoles = this._getAllowedRolesForAllChannels();
        return this.canAccessChannelRecords(allowedRoles);
    },
    /**
     * Fetch the allowed roles for a given channel and policy type
     * 
     * @param dpChannelGr GlideRecord of dp_channel table
     * @param policyType string specifying the type of policy
     * 
     * @returns CSV of allowed roles for given channel and policy type
     */
    getAllowedRoles: function(dpChannelGr, policyType) {
        if (policyType == DataPrivacyConstants.POLICY_TYPE_ANONYMIZATION)
            return dpChannelGr.allowed_roles.toString();
        else if (policyType == DataPrivacyConstants.POLICY_TYPE_DISCOVERY)
            return dpChannelGr.discovery_allowed_roles.toString();
        else
            return '';
    },
    /**
     * For a given data channel, fetches all the allowed roles for both anonymization and discovery.
     * 
     * @param dpChannelGr GlideRecord of dp_channel table
     * 
     * @returns CSV of allowed roles for given channel for both anonymization and discovery
     */
    _getAllowedRolesForChannel: function(dpChannelGr) {
        var anonymizationRoles = this._convertCsvToArray(dpChannelGr.allowed_roles.toString());
        var discoveryRoles = this._convertCsvToArray(dpChannelGr.discovery_allowed_roles.toString());
        var rolesList = anonymizationRoles.concat(discoveryRoles);
        return rolesList;
    },
    /**
     * Fetches CSV of unique roles configured across different channels
     */
    _getAllowedRolesForAllChannels: function() {
        var allowedRolesMap = {};
        var dpChannelGr = new GlideRecord(DataPrivacyConstants.TABLE_DP_CHANNEL);
        dpChannelGr.query();
        while (dpChannelGr.next()) {
            var rolesList = this._getAllowedRolesForChannel(dpChannelGr);
            for (var i = 0; i < rolesList.length; i++)
                allowedRolesMap[rolesList[i]] = true;
        }
        return Object.keys(allowedRolesMap).length > 0 ? Object.keys(allowedRolesMap).join(',') : '';
    },
    /**
     * Verifies if the user is maint user, has any of the given roles, or an admin for given policy type
     * 
     * @param allowedRoles a CSV of vaild roles to check
     * @param policyType string representing type of policy
     * 
     * @returns boolean true if user has atleast one of the given roles, or a maint user, or admin for given policy type.
     */
    _canAccessChannelConfigurationRecords: function(allowedRoles, policyType) {
        if (policyType == DataPrivacyConstants.POLICY_TYPE_ANONYMIZATION && this.isDataPrivacyAdmin())
            return true;

        if (policyType == DataPrivacyConstants.POLICY_TYPE_DISCOVERY && this.isDataDiscoveryAdmin())
            return true;

        return this._roleHasAccess(allowedRoles);
    },
    /**
     * Verifies if user has any of the given roles or a maint user
     * 
     * @param allowedRoles a CSV of vaild roles to check

     * @returns boolean true if user has atleast one of the given roles, or a maint user, or admin for given policy type.
     */
    _roleHasAccess: function(allowedRoles) {
        // if no roles are configured, then we check for "maint" role
        if (!allowedRoles || allowedRoles.length == 0) {
            return gs.hasRole(DataPrivacyConstants.MAINT);
        }

        // if atleast 1 role has been configured, hasRole inherently allows maint.
        return gs.hasRole(allowedRoles);
    },
    /**
     * convert a comma separated string to array
     * 
     * @param csvString comma separated string
     * 
     * @returns array of values
     */
    _convertCsvToArray: function(csvString) {
        if (!csvString || csvString.length == 0)
            return [];
        return csvString.split(',');
    },
    /**
     * Check if a policy type is valid
     * 
     * @param policyType string indicating the policy type
     * 
     * @returns boolean True if policy type is supported, false otherwise
     */
    _isValidPolicyType: function(policyType) {
        if (!policyType || policyType.length == 0)
            return false;

        return (policyType == DataPrivacyConstants.POLICY_TYPE_ANONYMIZATION || policyType == DataPrivacyConstants.POLICY_TYPE_DISCOVERY);
    },
    type: 'DataPrivacySecurityUtil'
};
