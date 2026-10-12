var PrivacyPolicyPatternHelper = Class.create();
PrivacyPolicyPatternHelper.prototype = {

    initialize: function() {},
    /**
     * method to fetch data patterns that are active for a given privacy configuration
     * @param privacyConfigId sysId of privacy configuration
     * 
     *	@returns map of data pattern sysId to name of data pattern
     */
    getSelectedDataPatterns: function(privacyConfigId, configTable) {
        var dpConfigPatternGr = new GlideRecord(DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN);
        dpConfigPatternGr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_ID, privacyConfigId);
        dpConfigPatternGr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_TABLE, configTable);
        dpConfigPatternGr.addQuery(DataPrivacyConstants.FIELD_ACTIVE, true);
        dpConfigPatternGr.orderBy(DataPrivacyConstants.FIELD_ORDER);
        dpConfigPatternGr.query();

        var selectedDataPatternMap = {};
        while (dpConfigPatternGr.next()) {
            selectedDataPatternMap[dpConfigPatternGr.getValue(DataPrivacyConstants.FIELD_DATA_PATTERN)] = dpConfigPatternGr.data_pattern.name.toString();
        }
        return selectedDataPatternMap;
    },
    /**
     * Method to fetch data patterns that are available for activation.
     * @param searchPrefix prefix of data pattern name to filter the available options.
     * @param selectedDataPatterns list of data pattern sysIds that are already active for the privacy configuration.
     * 
     * @returns map of data pattern sysId to name of data pattern
     */
    getPossibleDataPatterns: function(searchPrefix, selectedDataPatterns, privacyConfigId) {

        var dataPatternGr = new GlideRecord(DataPrivacyConstants.TABLE_DP_DATA_PATTERN);
        // Array of data channels for which the model type patterns will be hidden
        const noModelDataChannels = [DataPrivacyConstants.VA_DATA_CHANNEL
        ];
        if (searchPrefix)
            dataPatternGr.addQuery(DataPrivacyConstants.FIELD_NAME, 'STARTSWITH', searchPrefix);
        if (selectedDataPatterns.length > 0)
            dataPatternGr.addQuery(DataPrivacyConstants.FIELD_SYS_ID, 'NOT IN', selectedDataPatterns.join(','));
        if (GlidePluginManager.isActive('sn_data_discovery')) {
           var LICENSE_CHECK_API = new sn_data_discovery.DataDiscoveryLicensingUtil();
           if (this.LICENSE_CHECK_API &&
              !this.LICENSE_CHECK_API.hasSharedServicesUsageEntitlement()) {
              this._showInfoForMissingSharedServicesLicense();
               dataPatternGr.addQuery(DataPrivacyConstants.DATA_PATTERN_FIELD_TYPE, '!=', DataPrivacyConstants.DATA_PATTERN_TYPE_MODEL);
            }
        }
        var policyConfigGr = new GlideRecord("dp_configuration_domain_separated");
        if (policyConfigGr.get(privacyConfigId)) {
            var dataChannel = policyConfigGr.channel.name.toString();
            // Filter out model data patterns for unsupported channels
            if (noModelDataChannels.includes(dataChannel)) {
                dataPatternGr.addQuery(DataPrivacyConstants.DATA_PATTERN_FIELD_TYPE, '!=', DataPrivacyConstants.DATA_PATTERN_TYPE_MODEL);
            }
        }
        dataPatternGr.orderBy(DataPrivacyConstants.FIELD_NAME);
        dataPatternGr.query();

        var avaialableDataPatternMap = {};
        while (dataPatternGr.next())
            avaialableDataPatternMap[dataPatternGr.getUniqueValue()] = dataPatternGr.getValue(DataPrivacyConstants.FIELD_NAME);
        return avaialableDataPatternMap;
    },
    /**
     * For a given privacy configuration update the list of active data patterns.
     * This will also include deactivating existing data patterns that are not part of the current list of active patterns.
     * 
     * @param privacyConfigId sysId of the privacy configuration
     * @param dataPatternSysIds list of data pattern sysIds that must be active.
     */
    updatePolicyDataPatterns: function(privacyConfigId, configTable, dataPatternSysIds) {
        if (dataPatternSysIds.length == 0)
            return;

        var existingDataPatterns = this.getSelectedDataPatterns(privacyConfigId, configTable);
        var dataPatternsToDelete = [];
        var dataPatternsToAdd = [];
        for (var existingDataPatternSysId in existingDataPatterns) {
            if (!dataPatternSysIds.includes(existingDataPatternSysId)) {
                dataPatternsToDelete.push(existingDataPatternSysId);
            }
        }
        for (var i = 0; i < dataPatternSysIds.length; i++) {
            if (!(dataPatternSysIds[i] in existingDataPatterns))
                dataPatternsToAdd.push(dataPatternSysIds[i]);
        }
        this.deactivatePolicyDataPatterns(privacyConfigId, configTable, dataPatternsToDelete);
        this.addPolicyDataPatterns(privacyConfigId, configTable, dataPatternsToAdd);
        this.updateDataPatternsOrder(privacyConfigId, configTable, dataPatternSysIds);
    },
    /**
     * Method to deactivate data patterns for a given privacy configuration
     * @param privacyConfigId sysId of the privacy configuration
     * @param dataPatternSysIds list of data pattern sysIds that must be deactivated.
     */
    deactivatePolicyDataPatterns: function(privacyConfigId, configTable, dataPatternSysIds) {
        var gr = new GlideRecord(DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN);
        gr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_ID, privacyConfigId);
        gr.addQuery(DataPrivacyConstants.FIELD_DATA_PATTERN, 'IN', dataPatternSysIds.join(','));
        gr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_TABLE, configTable);
        gr.query();

        gr.setValue(DataPrivacyConstants.FIELD_ACTIVE, false);
        gr.updateMultiple();
    },
    /**
     * Activate data patterns for a given privacy configuration
     * If an entry for the data pattern and privacy configuration exists in the dp_m2m_configuration_pattern table, the active flag will be set to true. Otherwise, new entry will be created. 
     * 
     * @param privacyConfigId sysId of the privacy configuration
     * @param dataPatternSysIds list of data pattern sysIds that must be activated.
     */
    addPolicyDataPatterns: function(privacyConfigId, configTable, dataPatternSysIds) {
        var gr = new GlideRecord(DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN);
        gr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_ID, privacyConfigId);
        gr.addQuery(DataPrivacyConstants.FIELD_DATA_PATTERN, 'IN', dataPatternSysIds.join(','));
        gr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_TABLE, configTable);
        gr.query();

        var updatedDataPatterns = [];
        while (gr.next()) {
            updatedDataPatterns.push(gr.data_pattern.toString());
            gr.setValue(DataPrivacyConstants.FIELD_ACTIVE, true);
            gr.update();
        }

        gr = new GlideRecord(DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN);

        for (var i = 0; i < dataPatternSysIds.length; i++) {
            if (!dataPatternSysIds[i] || updatedDataPatterns.includes(dataPatternSysIds[i]))
                continue;
            gr.initialize();
            gr.config = privacyConfigId;
            gr.config_table = configTable;
            gr.active = true;
            gr.data_pattern = dataPatternSysIds[i];
            gr.insert();
        }

    },
    /**
     * sets the order of data pattern for a given privacy configuration based on their order in the slush bucket
     * 
     * @param privacyConfigId sysId of the privacy configuration
     * @param dataPatternSysIds list of selected data pattern sysIds.
     */
    updateDataPatternsOrder: function(privacyConfigId, configTable, dataPatternSysIds) {
        var i = 0;
        while (i < dataPatternSysIds.length) {
            var gr = new GlideRecord(DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN);
            gr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_ID, privacyConfigId);
            gr.addQuery(DataPrivacyConstants.FIELD_DATA_PATTERN, dataPatternSysIds[i]);
            gr.addQuery(DataPrivacyConstants.FIELD_PRIVACY_CONFIG_TABLE, configTable);
            gr.query();
            gr.setValue(DataPrivacyConstants.FIELD_ORDER, i);
            gr.updateMultiple();
            i++;
        }
    },
    /**
     * fetches list of privacy technique sysIds that are applicable to data patterns
     */
    getEligibleAnonymizationTechniques: function() {
        dataPatternAnonymizationTechniqueId = "601d418077003110840cac1d5b5a99cd"; // sys_id of Data Pattern Anonymization base technique

        gr = new GlideRecordSecure("dp_technique_with_params");
        gr.addQuery("technique", "!=", dataPatternAnonymizationTechniqueId);
        gr.query();

        techniqueSysIds = [];
        while (gr.next()) {
            techniqueSysIds.push(gr.getUniqueValue());
        }

        return techniqueSysIds.join(',');
    },
    _showInfoForMissingSharedServicesLicense: function() {
        let info = sn_i18n.Message.getMessage('com.glide.data_privacy', "AI/ML model based data patterns require an additional license and are subject to additional terms and conditions. Please contact your ServiceNow procurement admin [for license changes required to enable the feature] or [to verify whether your company is authorized to use this feature]");
        gs.addInfoMessage(info);
    },
    type: 'PrivacyPolicyPatternHelper'
};
