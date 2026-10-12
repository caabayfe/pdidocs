var TelemetryDAResolutionService = Class.create();
TelemetryDAResolutionService.prototype = {
    /**
     * Initialize the service and define all constants
     */
    initialize: function() {
        // Constants
        this.CONSTANTS = {
            FILTER_TYPE: 'filter_type',
            FILTER_ID: 'filter_id',
            FIELDS: 'fields',
            API_BASE: '/api/sn_telemetry_data/telemetry/filter/data'
        };

        // Filter configuration
        this.FILTER_CONFIG = {
            OBSERVABILITY: {
                id: 'observability',
                label: gs.getMessage('Select telemetry filter'),
                placeholder: gs.getMessage('Select telemetry filter'),
                helperText: gs.getMessage('telemetry filter')
            },
            SERVICE_NAME: {
                id: 'ServiceName',
                label: gs.getMessage('Select service name'),
                placeholder: gs.getMessage('Select service name'),
                helperText: gs.getMessage('service name')
            },
            METRIC_NAME: {
                id: 'MetricName',
                label: gs.getMessage('Select metric mame'),
                placeholder: gs.getMessage('Select metric name'),
                helperText: gs.getMessage('metric name')
            },
            METRIC_ATTRIBUTE_VALUE: {
                id: 'metric_attribute_value',
                label: gs.getMessage('Select metric attribute value'),
                placeholder: gs.getMessage('Select metric attribute value'),
                helperText: gs.getMessage('metric attribute value')
            }
        };

        // Filter items for the initial dropdown
        this.FILTER_ITEMS = [
            {
                id: 'metric_attribute_value',
                label: gs.getMessage('metric attribute values'),
            }
        ];

        this.metadataPayloadMaps = {
            'ServiceName': {
                "filterId": "instance_metadata",
                "dataType": "observability_metadata"
            },
            'metrics': {
                "filterId": "metric_details",
                "serviceName": "awh-gateway",
                "dataType": "observability_metadata_service"
            }
        };

        this.filterDetailsMap = {};
    },

    /**
     * Handle the resolution API request
     * @param {Object} payload - Current filter state
     * @param {string} filterType - Type of filter
     * @param {string} dataSource - Data source identifier
     * @param {string} mode - Operation mode (default: 'source')
     * @param {Object|null} source - Source object (optional)
     * @returns {Object} The response payload
     */
    handleResolutionApi: function(payload, filterType, dataSource, mode = 'source', source = null) {
        this._initializeFilterMetadata(payload.observability);
        const initialPayload = this._generateInitialPayload(dataSource, payload, filterType);

        if (this._isInitialState(payload)) {
            return initialPayload;
        }

        return this._buildResponsePayload(payload, dataSource, initialPayload);
    },

    /**
     * Initialize filter metadata based on the selected observability option
     * @private
     */
    _initializeFilterMetadata: function(observabilityOption) {
        // Clear previous metadata
        this.filterDetailsMap = {};

        // Common metadata for all flows
        const commonMetadata = [
            this._createMetadataItem('observability', gs.getMessage('Select metric attribute'), ['ServiceName']),
            this._createMetadataItem('ServiceName', gs.getMessage('Select service name'), ['MetricName'])
        ];

        // Metadata specific to metric_attribute_value flow
        if (observabilityOption === 'metric_attribute_value') {
            commonMetadata.push(
                this._createMetadataItem('MetricName', gs.getMessage('Select metric name'), ['metric_attribute_value']),
                this._createMetadataItem('metric_attribute_value', gs.getMessage('Select metric attribute value'))
            );
        } else {
            commonMetadata.push(
                this._createMetadataItem('MetricName', gs.getMessage('Select metric name'))
            );
        }

        // Register all metadata
        commonMetadata.forEach(item => this._registerMetadata(item));
    },

    /**
     * Create a metadata item
     * @private
     */
    _createMetadataItem: function(id, label, nextFilters = []) {
        return {
            id: id,
            label: label,
            nextFilters: nextFilters,
            config: this._getFilterConfig(id)
        };
    },

    /**
     * Register metadata in the filter details map
     * @private
     */
    _registerMetadata: function(metadata) {
        this.filterDetailsMap[metadata.id] = {
            params: metadata.nextFilters,
            label: metadata.label,
            filterId: metadata.id,
            staticItems: this.FILTER_ITEMS,
            disabled: false,
            config: metadata.config
        };
    },

    /**
     * Check if we're in the initial state
     * @private
     */
    _isInitialState: function(payload) {
        return Object.keys(payload).length === 0 || !payload.observability;
    },

    /**
     * Build the complete response payload
     * @private
     */
    _buildResponsePayload: function(payload, dataSource, initialPayload) {
        this._addNextFilterFields(payload, initialPayload);

        // Add config payload if conditions are met
        if (this._shouldAddConfigPayload(payload)) {
            initialPayload.configPayload = this._getConfigPayload(payload, dataSource);
        }


        // Set values for all fields
        this._setFieldValues(initialPayload[this.CONSTANTS.FIELDS], payload);

        return initialPayload;
    },

    /**
     * Add the next filter fields based on current selections
     * @private
     */
    _addNextFilterFields: function(payload, initialPayload) {
        Object.keys(payload).forEach(selectedKey => {
            const filterDetails = this.filterDetailsMap[selectedKey];

            if (filterDetails?.params?.length > 0) {
                const nextFilterId = filterDetails.params[0];
                const nextFilter = this.filterDetailsMap[nextFilterId];

                if (nextFilter) {
                    initialPayload[this.CONSTANTS.FIELDS].push(
                        this._generateRendererForFilter(nextFilter, payload)
                    );
                }
            }
        });
    },

    /**
     * Determine if we should add the config payload
     * @private
     */
    _shouldAddConfigPayload: function(payload) {
        const {
            observability
        } = payload;

        return (observability === 'metric_attribute_value' && payload.metric_attribute_value) ||
            (observability === 'metric_attribute' && payload.MetricName);
    },

    /**
     * Set values for fields based on payload
     * @private
     */
    _setFieldValues: function(fields, payload) {
        return fields.forEach(field => {
            if (payload[field.id]) {
                field.value = payload[field.id];
            }
        });
    },

    /**
     * Generate the initial payload structure
     * @private
     */
    _generateInitialPayload: function(dataSource, payload, filterType) {
        if (!gs.hasRole('sn_telemetry_data.observability_metric_creator')) {
            return {
                fields: [],
                targetOverrides: [],
                messages: [{
                    type: 'error',
                    message: gs.getMessage('Security constraints prevent access to field')
                }]

            }
        }
        return {
            fields: [this._createFieldConfig(this.FILTER_CONFIG.OBSERVABILITY)],
            targetOverrides: [{
                type: 'observability',
                payload: payload
            }],
        };
    },

    /**
     * Create field configuration
     * @private
     */
    _createFieldConfig: function(config) {
        return {
            id: config.id,
            label: config.label,
            type: 'selector',
            placeholder: config.placeholder,
            helperText: config.helperText,
            staticItems: this.FILTER_ITEMS
        };
    },

    /**
     * Generate renderer configuration for a filter
     * @private
     */
    _generateRendererForFilter: function(filterData, payload) {
        const config = filterData.config || {};
        const payloadParams = this._toQueryParams(payload);
        return {
            id: filterData.filterId,
            label: filterData.label,
            type: 'selector',
            placeholder: config.placeholder || 'Select',
            helperText: config.helperText || filterData.label,
            dataAPI: `${this.CONSTANTS.API_BASE}?${payloadParams}&filterId=${filterData.filterId}` 
        };
    },

    /**
     * Get configuration for a specific filter
     * @private
     */
    _getFilterConfig: function(filterId) {
        return Object.values(this.FILTER_CONFIG).find(
            config => config.id === filterId
        ) || {};
    },

    /**
     * Get configuration payload
     * @private
     */
    _getConfigPayload: function(payload, dataSource) {
        return {
            type: 'observability',
            payload: payload
        };
    },

    /**
     * Handle label API request
     * @param {string} payload - The filter identifier
     * @returns {string} The display label for the filter
     */
    handleLabelApi: function(payload) {
        return this.filterDetailsMap[payload]?.label || payload;
    },

    _toQueryParams: function(obj) {
        return Object.keys(obj)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
            .join("&");
    },

    _getStaticMetadataItems: function(payload) {
        var metadataPayload = {};
        if ('MetricName' in payload) {
            metadataPayload = {
                ...this.metadataPayloadMaps['metrics'],
                'serviceName': payload['ServiceName']
            };
        } else if ('ServiceName' in payload) {
            metadataPayload = {
                ...this.metadataPayloadMaps['metrics'],
                'serviceName': payload['ServiceName']
            };
        } else {
            metadataPayload = this.metadataPayloadMaps['ServiceName'];
        }
        const metadataResponse = new TelemetryDataHandler().getMetadata({
            'configuration': metadataPayload
        });
        return this._transformMetadataResponse(metadataResponse);
    },

    _transformMetadataResponse: function(response) {
        const responses = [];
        if ('ServiceNames' in response) {
            response['ServiceNames'].forEach((serviceName) => {
                responses.push({
                    id: serviceName?.Name,
                    label: serviceName?.Name
                });
            });
        } else if ('Attributes' in response) {
            response['Attributes'].forEach((attribute)=>{
                response.push({
                    id: attribute.key,
                    label: attribute.key
                });
            });
        }
        return responses;
    },


    type: 'TelemetryDAResolutionService'
};
