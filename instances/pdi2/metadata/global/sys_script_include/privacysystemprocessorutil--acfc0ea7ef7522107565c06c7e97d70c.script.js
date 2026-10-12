var PrivacySystemProcessorUtil = Class.create();
PrivacySystemProcessorUtil.prototype = {
    SYSTEM_CONFIG_TABLE: 'dp_system_processor_configuration',
    CONFIG_PATTERN_TABLE: 'dp_m2m_configuration_pattern_global',
    DEFAULT_DATA_PATTERN_TABLE: 'dp_data_pattern',
    SYSTEM_PROCESSOR_DATA_PATTERN_TABLES: {
        'AI Control Tower': ['sn_data_discovery_data_pattern', 'dp_data_pattern'],
        'Sensitive Data Trail': ['dp_data_pattern']
    },
    FIELD_CONFIG: 'config',
    FIELD_SYS_ID: 'sys_id',
    FIELD_ACTIVE: 'active',
    FIELD_DATA_CHANNEL: 'channel',
    FIELD_SYSTEM_PROCESSOR: 'system_processor',
    FIELD_CONFIG_TABLE: 'config_table',
    FIELD_DATA_PATTERN: 'data_pattern',
    FIELD_DATA_PATTERN_SELECTION: 'data_pattern_selection',
    FIELD_OUT_OF_THE_BOX: 'out_of_the_box',
    FIELD_DATA_PATTERN_TYPE: 'type',
    FIELD_SYSTEM_PROCESSOR_NAME: 'system_processor.name',
    FIELD_DATA_PATTERN_TABLE: 'data_pattern_table',
    SYSTEM_PROCESSOR_AICT: 'AI Control Tower',
    DATA_PATTERN_SELECTION_TYPE_OOB: 'out_of_the_box',
    DATA_PATTERN_TYPE_LOCAL: 'local',
    DATA_PATTERN_TYPE_MODEL: 'model',
    LEGACY_DATA_PATTERN_TABLE: 'sn_data_discovery_data_pattern',
    ERR_MSG_CONFIG_NOT_FOUND: sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'Failed to find configuration.'),
    ERR_MSG_NO_ACCESS_TO_CONFIG_RECORDS: sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'No access to configuration records.'),
    ERR_MSG_NO_DATA_PATTERNS: sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'No Data Patterns selected. Please set up data patterns to activate the configuration'),
    ERR_MSG_MODEL_DATA_PATTERN_UNSUPPORTED: sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'Model data patterns are not supported. Please remove them to activate the configuration'),
    ERR_MSG_DUPLICATE_DATA_PATTERNS_CONFIGURED: sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'Duplicate data patterns configured.'),
    ERR_MSG_SYSTEM_PROCESSOR_INACTIVE: sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'System processor is not active.'),
    initialize: function() {},
    /**
     * Validates if a system processor configuration is rightly configured. 
     * Validations include:
     * - At least 1 data pattern configured
     * - The data patterns for a system processor are configured from the expected data pattern table.
     * 
     * @param configId sys_id of the record from dp_system_processor_configuration
     * 
     * @returns json with two keys indicating validation status and errors if any.
     */
    validateSystemProcessorConfig: function(configId) {
        var errors = this._validateConfig(configId);
        var response = {
            'success': true
        };
        if (errors.length > 0) {
            response['success'] = false;
            response['errors'] = errors;
        }
        return response;
    },
    /**
     * Updates the configuration to active/inactive.
     */
    changeConfigActiveStatus: function(configId, active) {
        var configGr = this._getConfigRecord(configId);
        if (configGr.next()) {
            configGr.setValue(this.FIELD_ACTIVE, active);
            configGr.update();
        }
    },
    /**
     * Fetch the number of active configurations for a given system processor.
     * 
     * @param systemProcessorId sys_id of the system processor
     * @param dataChannelId sys_id of the data channel
     * 
     * @returns -1 if caller has no access, otherwise returns an integer representing number of active configurations. 
     */
    getActiveSystemProcessorConfigCount: function(systemProcessorId, dataChannelId) {
        var systemConfigGa = new GlideAggregate(this.SYSTEM_CONFIG_TABLE);
        if (!systemConfigGa.canRead())
            return -1;
        systemConfigGa.addQuery(this.FIELD_ACTIVE, true);
        systemConfigGa.addQuery(this.FIELD_SYSTEM_PROCESSOR, systemProcessorId);
        systemConfigGa.addQuery(this.FIELD_DATA_CHANNEL, dataChannelId);
        systemConfigGa.addAggregate('COUNT');
        systemConfigGa.query();
        return systemConfigGa.next() ? parseInt(systemConfigGa.getAggregate('COUNT')) : 0;
    },
    /**
     * Check if a system processor configuration is using data patterns from legacy data pattern table (sn_data_discovery_data_pattern)
     * 
     * @param systemProcessorConfigId sys_id of system processor configuration
     * 
     * @returns true if atleast one data pattern configured is from legacy data pattern table, false otherwise.
     */
    isUsingLegacyDataPatterns: function(systemProcessorConfigId) {
        var configPatternGa = new GlideAggregate(this.CONFIG_PATTERN_TABLE);
        if (!configPatternGa.canRead())
            return false;
        configPatternGa.addQuery(this.FIELD_CONFIG, systemProcessorConfigId);
        configPatternGa.addQuery(this.FIELD_DATA_PATTERN_TABLE, this.LEGACY_DATA_PATTERN_TABLE);
        configPatternGa.addAggregate('COUNT');
        configPatternGa.query();
        return configPatternGa.next() && parseInt(configPatternGa.getAggregate('COUNT')) > 0;
    },
    _getConfigRecord: function(configId) {
        var configGr = new GlideRecordSecure(this.SYSTEM_CONFIG_TABLE);
        configGr.addQuery(this.FIELD_SYS_ID, configId);
        configGr.query();

        return configGr;
    },
    _validateConfig: function(configId) {
        var errMsgs = [];

        var configGr = this._getConfigRecord(configId);

        if (!configGr.next()) {
            errMsgs.push(this.ERR_MSG_CONFIG_NOT_FOUND);
            return errMsgs;
        }

        var systemProcessorErrs = this._validateSystemProcessor(configGr);
        errMsgs = errMsgs.concat(systemProcessorErrs);

        var systemProcessorName = configGr.system_processor.name.toString();

        // validate data patterns
        var patternErrs = (configGr.getValue(this.FIELD_DATA_PATTERN_SELECTION) == this.DATA_PATTERN_SELECTION_TYPE_OOB) ?
            this._validateOOBDataPatterns(systemProcessorName) :
            this._validateDataPatterns(configId, systemProcessorName);
        return errMsgs.concat(patternErrs);
    },
    _validateSystemProcessor: function(configGr) {
        var errMsgs = [];
        if (configGr.system_processor.active.toString() === "false")
            errMsgs.push(this.ERR_MSG_SYSTEM_PROCESSOR_INACTIVE);
        return errMsgs;
    },
    _validateOOBDataPatterns: function(systemProcessorName) {
        var dataPatternTableList = this._getSystemProcessorDataPatternTable(systemProcessorName);
        var oobPatternErrs = [];
        for (var i = 0; i < dataPatternTableList.length; i++) {
            var dataPatternTable = dataPatternTableList[i];
            var oobDataPatternCount = this._getOOBDataPatternsCount(dataPatternTable);
            if (oobDataPatternCount <= 0) {
                oobPatternErrs.push(sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'No out of box data patterns found in {dataPatternTable}.', {
                    'dataPatternTable': dataPatternTable
                }));
            }
        }
        return oobPatternErrs;
    },
    _validateDataPatterns: function(configId, systemProcessorName) {
        var errorMsgs = [];
        var patternCount = 0;
        var patternsConfiguredMap = {}; // map to capture if a pattern is already configured.

        var configPatternGr = new GlideRecordSecure(this.CONFIG_PATTERN_TABLE);
        configPatternGr.addQuery(this.FIELD_CONFIG_TABLE, this.SYSTEM_CONFIG_TABLE);
        configPatternGr.addQuery(this.FIELD_CONFIG, configId);
        configPatternGr.query();

        while (configPatternGr.next()) {
            var dataPatternTable = configPatternGr.getValue(this.FIELD_DATA_PATTERN_TABLE);
            var dataPatternId = configPatternGr.getValue(this.FIELD_DATA_PATTERN);
            var expectedDataPatternTableList = this._getSystemProcessorDataPatternTable(systemProcessorName);

            if (!expectedDataPatternTableList.includes(dataPatternTable)) {
                errorMsgs.push(sn_i18n.Message.getMessage('com.glide.data_privacy_core', 'Only data patterns from {dataPatternTable} table can be configured for {systemProcessor}.', {
                    'systemProcessor': systemProcessorName,
                    'dataPatternTable': expectedDataPatternTableList.join(',')
                }));
                return errorMsgs;
            }

            var dataPatternType = configPatternGr.data_pattern.type.toString();
            if (dataPatternType && dataPatternType == this.DATA_PATTERN_TYPE_MODEL) {
                errorMsgs.push(this.ERR_MSG_MODEL_DATA_PATTERN_UNSUPPORTED);
                return errorMsgs;
            }

            var key = `${dataPatternTable}~${dataPatternId}`;
            if (key in patternsConfiguredMap) {
                errorMsgs.push(this.ERR_MSG_DUPLICATE_DATA_PATTERNS_CONFIGURED);
                return errorMsgs;
            }
            patternsConfiguredMap[key] = true;
            patternCount++;
        }

        if (patternCount == 0)
            errorMsgs.push(this.ERR_MSG_NO_DATA_PATTERNS);

        return errorMsgs;
    },
    _getSystemProcessorDataPatternTable: function(systemProcessorName) {
        return (systemProcessorName in this.SYSTEM_PROCESSOR_DATA_PATTERN_TABLES) ?
            this.SYSTEM_PROCESSOR_DATA_PATTERN_TABLES[systemProcessorName] : this.DEFAULT_DATA_PATTERN_TABLE;
    },
    _getOOBDataPatternsCount: function(dataPatternTable) {
        var dataPatternGa = new GlideAggregate(dataPatternTable);

        if (!dataPatternGa.canRead())
            return -1;

        dataPatternGa.addQuery(this.FIELD_OUT_OF_THE_BOX, true);
        dataPatternGa.addQuery(this.FIELD_DATA_PATTERN_TYPE, this.DATA_PATTERN_TYPE_LOCAL);
        dataPatternGa.addAggregate('COUNT');
        dataPatternGa.query();
        return dataPatternGa.next() ? parseInt(dataPatternGa.getAggregate('COUNT')) : 0;
    },
    type: 'PrivacySystemProcessorUtil'
};
