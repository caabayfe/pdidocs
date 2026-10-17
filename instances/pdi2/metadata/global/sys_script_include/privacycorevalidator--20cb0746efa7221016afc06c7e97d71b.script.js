var PrivacyCoreValidator = Class.create();
PrivacyCoreValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    setPolicyActive: function() {
        var sysid = this.getParameter('sysparm_dp_policyID');
        var active = this.getParameter('sysparm_active');
        var configTable = this.getParameter('sysparm_config_table');
        var gr = new GlideRecordSecure(configTable);
        gr.get("sys_id", sysid);
        gr.setValue('active', active);
        gr.update();
    },

    validatePolicyUtil: function(policyId, configTable) {
        var validatorApi = new SNC.DataPrivacyCoreValidator();
        var result = validatorApi.validatePolicy(policyId, configTable);
        result = JSON.stringify(result);
        return result;
    },

    /**
     * Validate a policy
     */
    validatePolicy: function() {
        var policyId = this.getParameter('sysparm_policyId');
        var configTable = this.getParameter('sysparm_config_table');
        return this.validatePolicyUtil(policyId, configTable);
    },
    isPolicyInDomain: function() {
        // if domain plugin is not active, answer is always true
        if (!GlidePluginManager.isActive(DataPrivacyConstants.DOMAIN_PLUGIN_ID))
            return true;

        var policyId = this.getParameter('sysparm_policyId');
        var configTable = this.getParameter('sysparm_config_table');
        var gr = new GlideRecordSecure(configTable);

        // if config table is not domain separated, answer is true
        if (!gr.isValidField(DataPrivacyConstants.FIELD_SYS_DOMAIN))
            return true;

        // if record does not exist, return false
        if (!gr.get("sys_id", policyId))
            return false;
        var recordDomain = gr.getValue(DataPrivacyConstants.FIELD_SYS_DOMAIN);
        var sessionDomain = gs.getSession().getCurrentDomainID();
        if (sessionDomain == null)
            sessionDomain = DataPrivacyConstants.GLOBAL_DOMAIN;

        // otherwise, record should exist and the record domain should match with session domain.
        return recordDomain == sessionDomain;
    },
    getNumActivePolicies: function() {
        var policyId = this.getParameter('sysparm_policyId');
        var channelSysId = this.getParameter('sysparm_channel_sysid');
        var policyType = this.getParameter('sysparm_policy_type');
        var gr = new GlideRecordSecure(DataPrivacyConstants.TABLE_DP_CONFIGURATION_DOMAIN_SEPARATED);
        gr.addQuery(DataPrivacyConstants.FIELD_SYS_ID, '!=', policyId);
        gr.addQuery(DataPrivacyConstants.FIELD_DATA_CHANNEL, channelSysId);
        gr.addQuery(DataPrivacyConstants.FIELD_ACTIVE, true);
        gr.addQuery(DataPrivacyConstants.FIELD_POLICY_TYPE, policyType);
        gr.query();

        return gr.next() ? gr.getRowCount() : 0;
    },

	/**
     * Validate technique parameter values for a parameterized technique
     */
    validateParameterValues: function() {
        var techniqueParams = this.getParameter('sysparm_techniqueParams');
        var value = this.getParameter('sysparm_value');
        return this.validateParameterValuesUtil(techniqueParams, value);
    },

    validateParameterValuesUtil: function(techniqueParams, value) {
        var validatorApi = new SNC.DataPrivacyCoreValidator();
        var result = validatorApi.validateParameterValues(techniqueParams, value);
        return result;
    },
    type: 'PrivacyCoreValidator'
});
