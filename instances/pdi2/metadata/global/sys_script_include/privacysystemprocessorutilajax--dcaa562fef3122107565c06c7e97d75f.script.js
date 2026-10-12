var PrivacySystemProcessorUtilAjax = Class.create();
PrivacySystemProcessorUtilAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    systemProcessorUtil: new PrivacySystemProcessorUtil(),
    /**
     * Utility function to validate a system processor configuration
     * 
     * @param sysparm_config_id sys_id of the record from dp_system_processor_configuration
     * @returns JSON string indicating if validation was successful and list of error messages if any.
     */
    validateConfig: function() {
        var configId = this.getParameter('sysparm_config_id');
        var response = this.systemProcessorUtil.validateSystemProcessorConfig(configId);
        return JSON.stringify(response);
    },
    /**
     * Utility function to update the system processor configuration to active/inactive.
     * 
     * @param sysparm_config_id sys_id of the record from dp_system_processor_configuration
     * @param sysparm_active boolean flag indicating the intended state of the configuration record
     */
    switchConfigActiveStatus: function() {
        var configId = this.getParameter('sysparm_config_id');
        var active = this.getParameter('sysparm_active');
        var response = this.systemProcessorUtil.changeConfigActiveStatus(configId, active);
        return JSON.stringify(response);
    },
    /**
     * Utility function to fetch number of active system processor configurations
     * 
     * @param sysparm_system_processor_id sys_id of the system processor
     * @param sysparm_data_channel_id sys_id of the data channel
     * @returns returns -1 if caller has no access, otherwise returns an integer representing number of active configurations. 
     */
    getNumActiveConfigurations: function() {
        var systemProcessorId = this.getParameter('sysparm_system_processor_id');
        var dataChannelId = this.getParameter('sysparm_data_channel_id');
        return this.systemProcessorUtil.getActiveSystemProcessorConfigCount(systemProcessorId, dataChannelId);
    },
    /**
     * Utility function to validate if a system processor configuration is using legacy data patterns
     * 
     * @param sysparm_system_processor_config_id sys_id of system processor configuration
     * 
     * @returns true if atleast one data pattern configured is from legacy data pattern table, false otherwise.
     */
    isUsingLegacyDataPatterns: function() {
		var systemProcessorConfigId = this.getParameter('sysparm_system_processor_config_id');
		return this.systemProcessorUtil.isUsingLegacyDataPatterns(systemProcessorConfigId);
    },
    type: 'PrivacySystemProcessorUtilAjax'
});
