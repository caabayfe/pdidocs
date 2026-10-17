var ExperimentCDSDataProcessor = Class.create();
ExperimentCDSDataProcessor.prototype = {
    initialize: function() {
        this.experimentDao = new sn_experiment_core.ExperimentDao();
        this.variantDao = new sn_experiment_core.VariantDao();
        this.featureFlagDao = new sn_experiment_core.FeatureFlagDao();
        this.segmentDao = new sn_experiment_core.SegmentDao();
        this.metricMappingDao = new sn_experiment_core.MetricMappingDao();

        this.STAGING_TABLE = 'sn_experiment_core_experimentation_executor_client_staging';
        this.CATEGORY_AB_TESTING = 'ab_testing';
        this.STATUS_DRAFT = 'draft';
        this.PARENT_TABLE_EXPERIMENT = 'sn_experiment_core_experiment';
        this.PARENT_TABLE_FEATURE_FLAG = 'sn_experiment_core_feature_flag';
        this.EXPERIMENT_NOTIFY = 'sn_experiment_core.experiment_notify';
    },

    /**
     * Processes all unprocessed records from the staging table
     * @returns {Object} Processing summary with counts and details (NOTE: This function doesn't return a summary in its current form, but the comment is retained for context)
     */
    processUnprocessedRecords: function() {
        var expSysIds = [];
        // Query unprocessed records
        var gr = new GlideRecord(this.STAGING_TABLE);
        gr.addQuery('status', 'unprocessed');
        gr.orderBy('u_created_time');
        gr.query();

        while (gr.next()) {
            var recordSysId = gr.getUniqueValue();
            var payload = gr.getValue('payload');

            try {
                // Process the payload JSON data
                var processingResult = this._processExperimentData(payload);

                if (processingResult.success) {
                    gr.status = "success";
                    gr.error_message = "";
                    expSysIds.push(processingResult.experimentSysId);
                } else {
                    // Update record as failed with error message
                    gr.status = "failure";
                    gr.error_message = processingResult.errorMessage;
                }


            } catch (recordError) {
                gr.status = "failure";
                gr.error_message = recordError.getMessage();
                // Handle individual record processing errors
                gs.error('ExperimentCDSDataProcessor.processUnprocessedRecords: ' + recordError.getMessage() + ' for record ' + recordSysId);
            }
            gr.update();
        }

        if (gs.getProperty(ExperimentationConstants.UPGRADED_PROPERTY, false) == "true") {
            this._cancelPreviousReleaseExperiments(expSysIds);
            gs.setProperty(ExperimentationConstants.UPGRADED_PROPERTY, false);
        }
    },


    /**
     * Main processing function that converts JSON data to objects and saves to database
     * @param {String|Object} jsonData - JSON string or parsed JSON object containing experiment, variants, and optional feature flag/segment/metric mapping data
     * @returns {Object} Processing result with success status and details
     */
    _processExperimentData: function(jsonData) {
        try {
            // Validate input data
            var validationResult = this._validateInput(jsonData);
            if (!validationResult.isValid) {
                return this._createErrorResult(validationResult.errorMessage);
            }

            var data = validationResult.data;

            // Check if the current instance is denied and update status if needed
            data = this._checkAndApplyDenyList(data);

            var shouldNotify = this._shouldNotifyUsers(data.experiment);

            // --- SEGMENT ---
            var segmentSysId = this._saveSegment(data.segment);

            // --- FEATURE FLAG ---
            var featureFlagSysId = this._saveFeatureFlag(data.featureFlag);
            if (data.experiment.category !== this.CATEGORY_AB_TESTING && !featureFlagSysId) {
                return this._createErrorResult('Failed to save mandatory feature flag. Check FeatureFlagDao logs for details.');
            }

            // --- EXPERIMENT ---
            var experimentSysId = this._saveExperiment(data.experiment, segmentSysId, featureFlagSysId);
            if (!experimentSysId) {
                return this._createErrorResult('Failed to save experiment to database. Check ExperimentDao logs for details.');
            }

            // --- VARIANTS ---
            var parentSysId = experimentSysId;
            var parentTable = this.PARENT_TABLE_EXPERIMENT;
            var savedVariants = this._saveVariants(data.variants, parentSysId, parentTable);

            // --- METRIC MAPPING ---
            if (data.metricMapping && Array.isArray(data.metricMapping)) {
                this._saveMetricMapping(data.metricMapping, experimentSysId);
            }

            // --- NOTIFY ---
            if(shouldNotify) {
                this._notifyNewExperiment(data.experiment.key);
            }
            return this._createSuccessResult(experimentSysId, savedVariants);

        } catch (error) {
            gs.error('ExperimentCDSDataProcessor.processExperimentData: Unexpected error: ' + error.message);
            return this._createErrorResult('Unexpected error during processing: ExperimentCDSDataProcessor: ' + error.message);
        }
    },

    /**
     * Validates input JSON data
     * @param {String|Object} input - Input data to validate
     * @returns {Object} Validation result with isValid flag and data/errorMessage
     * @private
     */
    _validateInput: function(input) {
        try {
            var data = typeof input === 'string' ? JSON.parse(input) : input;

            if (!data || !data.experiment || !data.variants) {
                return {
                    isValid: false,
                    errorMessage: "Invalid input format: Both experiment and variants data must be present"
                };
            }

            if (!Array.isArray(data.variants) || data.variants.length === 0) {
                return {
                    isValid: false,
                    errorMessage: "Invalid input format: Variants must be a non-empty array"
                };
            }

            if (!this._safeString(data.experiment.name) || !this._safeString(data.experiment.key)) {
                return {
                    isValid: false,
                    errorMessage: "Experiment must have a valid name and key"
                };
            }

            var experimentCategory = data.experiment.category;

            // Check category-specific disable property
            var experimentUtil = new sn_experiment_core.ExperimentUtil();
            if (experimentUtil.isDisabled(experimentCategory)) {
                var categoryLabel = (experimentCategory === this.CATEGORY_AB_TESTING) ? ExperimentationConstants.EXPERIMENT_CATEGORY_LABEL.AB_TESTING : ExperimentationConstants.EXPERIMENT_CATEGORY_LABEL.FEATURE_FLAG;
                return {
                    isValid: false,
                    errorMessage: categoryLabel + ' is disabled on this instance. Skipping experiment: ' + data.experiment.key
                };
            }

            if (experimentCategory === this.CATEGORY_AB_TESTING) {
                if (data.featureFlag) {
                    return {
                        isValid: false,
                        errorMessage: "AB testing experiments must not have featureFlag object"
                    };
                }
            } else {
                if (!data.featureFlag) {
                    return {
                        isValid: false,
                        errorMessage: "Feature flag experiments must include featureFlag object"
                    };
                }
            }

            var pluginActiveResult = this._areAllPluginsActive(data.experiment.pluginId);
            if (pluginActiveResult && !pluginActiveResult.isValid) {
                return pluginActiveResult;
            }

            return {
                isValid: true,
                data: data
            };
        } catch (parseError) {
            return {
                isValid: false,
                errorMessage: "Invalid JSON format: " + parseError.message
            };
        }
    },

    _areAllPluginsActive: function(pluginIds) {
        var result = {
            isValid: true,
            errorMessage: ""
        };

        if (this._safeString(pluginIds)) {
            var plugins = pluginIds.split(",");

            for (var i = 0; i < plugins.length; i++) {
                var pluginId = plugins[i].trim();

                if (!pluginId) {
                    continue;
                }

                if (!GlidePluginManager.isActive(pluginId)) {
                    result.isValid = false;
                    result.errorMessage = "Plugin " + pluginId + " is not active";
                    return result;
                }
            }
        }

        return result;
    },

    /**
     * Creates Experiment from experiment JSON data
     * @param {Object} experimentData - Experiment data from JSON
     * @returns {Object} The created Experiment object
     * @private
     */
    _createExperiment: function(experimentData, segmentSysId, featureFlagSysId) {
        var experiment = new sn_experiment_core.Experiment();
        experiment
            .setSysId(this._safeString(experimentData.sysId))
            .setName(this._safeString(experimentData.name))
            .setDescription(this._safeString(experimentData.description))
            .setStartDate(experimentData.startDate ? this._convertMillisecondsToGlideDateTime(experimentData.startDate) : null)
            .setStickiness(this._safeString(experimentData.stickiness))
            .setStatus(this._safeString(experimentData.status) || this.STATUS_DRAFT)
            .setKey(this._safeString(experimentData.key))
            .setInstanceType(this._safeString(experimentData.instanceType))
            .setCategory(this._safeString(experimentData.category))
            .setSegment(segmentSysId)
            .setFeatureFlag(featureFlagSysId)
            .setIsGA(experimentData.isGA);
        return experiment;
    },

    /**
     * Creates array of Variant objects from variants JSON data
     * @param {Array} variantsData - Variants data array from JSON
     * @param {String} parentSysId - The sys_id of the parent experiment or feature flag
     * @returns {Array} An array of created Variant objects
     * @private
     */
    _createVariants: function(variantsData, parentSysId, parentTable) {
        var variants = [];
        for (var i = 0; i < variantsData.length; i++) {
            var variantData = variantsData[i];

            var variant = new sn_experiment_core.Variant();
            variant
                .setVariantId(this._safeString(variantData.sysId))
                .setParentId(parentSysId)
                .setParentTable(parentTable)
                .setName(this._safeString(variantData.name))
                .setDescription(this._safeString(variantData.description))
                .setPercentage(parseFloat(variantData.percentage) || 0.0)
                .setValue(this._safeString(variantData.value))
                .setDefaultVariant(this._safeString(variantData.defaultVariant));

            variants.push(variant);
        }
        return variants;
    },

    /**
     * Saves segment data to the database using SegmentDao.
     * Honors inbound sysId for upsert capability. Uses basic presence check only.
     * @param {Object} segmentData - Segment data from JSON.
     * @returns {String|null} The sys_id of the saved segment or null if data object is not present or save fails.
     * @private
     */
    _saveSegment: function(segmentData) {
        if (!segmentData) {
            return null;
        }

        var segment = new sn_experiment_core.Segment.fromJSON(segmentData);

        return this.segmentDao.saveSegment(segment);
    },

    /**
     * Saves feature flag data to the database using FeatureFlagDao.
     * Honors inbound sysId for upsert capability. Uses basic presence check only.
     * @param {Object} featureFlagData - Feature Flag data from JSON.
     * @returns {String|null} The sys_id of the saved feature flag or null if data object is not present or save fails.
     * @private
     */
    _saveFeatureFlag: function(featureFlagData) {
        if (!featureFlagData) {
            return null;
        }

        var featureFlag = new sn_experiment_core.FeatureFlag();
        featureFlag.setSysId(this._safeString(featureFlagData.sysId));
        featureFlag.setName(this._safeString(featureFlagData.name));
        featureFlag.setKey(this._safeString(featureFlagData.key));
        featureFlag.setType(this._safeString(featureFlagData.type) || 'boolean');
        featureFlag.setDescription(this._safeString(featureFlagData.description));
        featureFlag.setOverview(this._safeString(featureFlagData.overview));
        featureFlag.setCapabilities(this._safeString(featureFlagData.capabilities));
        featureFlag.setAppScope(this._safeString(featureFlagData.appScope));
        featureFlag.setAppMinVersion(this._safeString(featureFlagData.minAppVersion));

        return this.featureFlagDao.saveFeatureFlag(featureFlag);
    },

    _saveExperiment: function(experimentData, segmentSysId, featureFlagSysId) {
        if (!experimentData) {
            return null;
        }

        var experiment = this._createExperiment(experimentData, segmentSysId, featureFlagSysId);
        if (!experiment) {
            return null;
        }

        return this.experimentDao.saveExperiment(experiment);
    },

    _saveVariants: function(variantsData, parentSysId, parentTable) {
        if (!Array.isArray(variantsData)) {
            return [];
        }

        var variants = this._createVariants(variantsData, parentSysId, parentTable);
        var savedVariants = [];
        for (var i = 0; i < variants.length; i++) {
            var variant = variants[i];
            if (this.variantDao.saveVariant(variant) != null) {
                savedVariants.push(variant.getVariantId());
            }
        }
        return savedVariants;
    },

    /**
     * Saves metric mapping data to the database using MetricMappingDao.
     * @param {Array<Object>} metricMappingArray - Array of metric mapping data from JSON.
     * @param {String} experimentSysId - The experiment sys_id to associate the metric mapping with.
     * @private
     */
    _saveMetricMapping: function(metricMappingArray, experimentSysId) {
        for (var i = 0; i < metricMappingArray.length; i++) {
            var metricMappingData = metricMappingArray[i];
            var metricMapping = new sn_experiment_core.MetricMapping();

            metricMapping.setSysId(this._safeString(metricMappingData.sysId));
            metricMapping.setDefinitionId(this._safeString(metricMappingData.definitionId));
            metricMapping.setExperiment(experimentSysId);
            metricMapping.setMetadata(metricMappingData.metadata);

            this.metricMappingDao.saveMetricMapping(metricMapping);
        }
        return {
            success: true
        };
    },

    /**
     * Determines if a user notification should be sent.
     * Criteria: Must be a new experiment AND the payload must request notification.
     * @param {Object} experimentData - The experiment data object from the payload.
     * @returns {Boolean} True if notification should be sent, False otherwise.
     * @private
     */
    _shouldNotifyUsers: function(experimentData) {
        if (!experimentData || !experimentData.key) {
            return false;
        }

        var experimentService = new sn_experiment_core.ExperimentService();
        var experimentDto = experimentService.getExperiment(experimentData.key);
        var isNewExperiment = !experimentDto;

        return isNewExperiment;
    },

    /**
     * Handles event queuing for a newly created experiment.
     * @param {String} experimentKey - The key of the newly created experiment record.
     * @private
     */
    _notifyNewExperiment: function(experimentKey) {
        if (!experimentKey) {
            gs.error('ExperimentCDSDataProcessor._notifyNewExperiment: Cannot notify, experimentKey is missing.');
            return;
        }

        var experimentGR = this.experimentDao.getExperimentGrByKey(experimentKey);
        if (experimentGR != null) {
            gs.eventQueue(this.EXPERIMENT_NOTIFY, experimentGR, gs.getUserID(), gs.getUserName());
        } else {
            gs.error('ExperimentCDSDataProcessor._notifyNewExperiment: Failed to retrieve GlideRecord for sys_id: ' + experimentSysId);
        }
    },

    /**
     * Converts milliseconds timestamp to GlideDateTime
     * @param {Number} milliseconds - Timestamp in milliseconds
     * @returns {GlideDateTime} GlideDateTime object
     * @private
     */
    _convertMillisecondsToGlideDateTime: function(milliseconds) {
        var glideDateTime = new GlideDateTime();
        glideDateTime.setNumericValue(milliseconds);
        return glideDateTime;
    },

    /**
     * Creates a success result object
     * @param {String} experimentSysId - The saved experiment sys_id
     * @param {Array} savedVariants - Array of saved variant identifiers
     * @returns {Object} Success result object
     * @private
     */
    _createSuccessResult: function(experimentSysId, savedVariants) {
        return {
            success: true,
            experimentSysId: experimentSysId,
            variantCount: savedVariants.length,
            savedVariants: savedVariants,
            message: 'Successfully processed experiment and ' + savedVariants.length + ' variants'
        };
    },

    /**
     * Creates an error result object
     * @param {String} errorMessage - The error message
     * @returns {Object} Error result object
     * @private
     */
    _createErrorResult: function(errorMessage) {
        return {
            success: false,
            errorMessage: errorMessage
        };
    },
    /**
     * Checks if the current instance is denied access to the experiment
     * @param {Object} payload - Parsed JSON payload containing experimentAccessRules
     * @returns {Object} Updated payload with status set to 'cancel' if instance is denied
     * @private
     */
    _checkAndApplyDenyList: function(payload) {
        try {
            var instanceId = gs.getProperty('instance_id'); // Get current instance id
            if (!payload || !payload.experimentAccessRules) {
                return payload;
            }

            for (var i = 0; i < payload.experimentAccessRules.length; i++) {
                var rule = payload.experimentAccessRules[i];
                if (rule.instanceId === instanceId && rule.accessType === 'denylist') {
                    gs.info('ExperimentCDSDataProcessor: Instance ' + instanceId + ' is denied. Cancelling experiment ' + payload.experiment.experimentId);
                    payload.experiment.status = 'cancel';
                    break;
                }
            }
        } catch (error) {
            gs.error('ExperimentCDSDataProcessor._checkAndApplyDenyList: Error checking deny list: ' + error.message);
        }
        return payload;
    },


    /**
     * Safely retrieves and trims a string value, returning an empty string ('') if not a valid string.
     * @param {String} str - The string to process
     * @returns {String} The trimmed string or an empty string ('')
     * @private
     */
    _safeString: function(str) {
        if (str && typeof str === 'string') {
            var trimmed = str.trim();
            return trimmed.length > 0 ? trimmed : '';
        }
        return '';
    },

    _cancelPreviousReleaseExperiments: function(expSysIds) {
        var gr = new GlideRecord(ExperimentationConstants.EXPERIMENT_TABLE);
        gr.addQuery("sys_id", "NOT IN", expSysIds);
        gr.addQuery("status", "NOT IN", [ExperimentationConstants.STATUS.COMPLETE, ExperimentationConstants.STATUS.CANCEL]);
        gr.setValue("status", ExperimentationConstants.STATUS.CANCEL);
        gr.updateMultiple();
    },

    type: 'ExperimentCDSDataProcessor'
};
