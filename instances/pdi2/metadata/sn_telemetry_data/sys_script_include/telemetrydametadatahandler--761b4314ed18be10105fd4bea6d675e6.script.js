/**
 * @file TelemetryDAMetadataHandler.js
 * @description Handles metadata operations for OpenTelemetry data access
 * @class TelemetryDAMetadataHandler
 */
var TelemetryDAMetadataHandler = Class.create();

TelemetryDAMetadataHandler.prototype = {
    /**
     * @constructor
     * @description Initialize the metadata handler with configurations and constants
     */
    initialize: function() {
        // Constants
        this.METADATA_TYPES = {
            SERVICE_NAMES: 'service_names',
            METRIC_DETAILS: 'metric_details',
            METRIC_ATTRIBUTE_VALUES: 'metric_attribute_values'
        };

        this.FILTER_IDS = {
            INSTANCE_METADATA: 'instance_metadata',
            METRIC_DETAILS: 'metric_details',
            SERVICE_NAME: 'ServiceName',
            METRIC_NAME: 'MetricName',
            METRIC_ATTRIBUTE_VALUE: 'metric_attribute_value'
        };

        this.DATA_TYPES = {
            OBSERVABILITY_METADATA: 'observability_metadata',
            OBSERVABILITY_METADATA_SERVICE: 'observability_metadata_service'
        };

        this.DEFAULT_PAGINATION = {
            MAX_RECORDS: 500,
            NEXT_RECORD_IDX: -1
        };

        this.ATTRIBUTE_TYPES = ['number', 'string', 'boolean'];
        this.DEFAULT_ATTRIBUTE_TYPE = 'string';
        this.API_ENDPOINTS = {
            METRIC_ATTRIBUTE_VALUES: '/telemetry/get-metric-attribute-values'
        };

        // Configuration
        this._metadataConfig = {
            service_name: {
                filterId: this.FILTER_IDS.INSTANCE_METADATA,
                dataType: this.DATA_TYPES.OBSERVABILITY_METADATA
            },
            metrics: {
                filterId: this.FILTER_IDS.METRIC_DETAILS,
                serviceName: '',
                dataType: this.DATA_TYPES.OBSERVABILITY_METADATA_SERVICE
            }
        };
    },

    /**
     * Handle resolution of metadata based on request parameters
     * @param {Object} params - Request parameters
     * @param {string} params.requestFilterId - Type of filter being requested
     * @param {string} [params.requestServiceName] - Service name for metric lookups
     * @param {string} [params.requestMetricName] - Metric name for attribute lookups
     * @returns {Object} Formatted response with resolution data
     * @throws {Error} If required parameters are missing or invalid
     */
    handleResolutionDataApi: function(params) {
        this._validateParams(params, ['requestFilterId']);
        
        try {
            const { requestFilterId, requestServiceName, requestMetricName } = params;
            const metadataPayload = this._getMetadataPayload(requestFilterId, requestServiceName);
            
            const metadataResponse = new TelemetryDataHandler().getMetadata({
                configuration: metadataPayload
            });

            return this._transformResolutionResponse(
                metadataResponse,
                requestFilterId,
                requestMetricName
            );
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get metadata based on parameters
     * @param {Object} params - Request parameters
     * @returns {Object} Formatted response with requested metadata
     * @throws {Error} If required parameters are missing or invalid
     */
    getMetadata: function(params) {
        this._validateParams(params, ['observability']);

        try {
            const {
                metric_attribute_value: metricAttributeValue,
                MetricName,
                observability,
                ServiceName,
                selectedValues = [],
                maxNbRecords = this.DEFAULT_PAGINATION.MAX_RECORDS,
                search = ''
            } = params;

            if (observability === 'metric_attribute') {
                this._validateParams(params, ['ServiceName', 'MetricName']);
                return this._handleMetricAttributeMetadata(
                    ServiceName,
                    MetricName,
                    selectedValues,
                    search
                );
            }

            if (observability === 'metric_attribute_value') {
                this._validateParams(params, ['ServiceName', 'MetricName', 'metric_attribute_value']);
                const { type, key } = this._parseAttributeIdentifier(metricAttributeValue);
                
                const attributeValues = this._getMetricAttributeValues({
                    service_name: ServiceName,
                    metric_name: MetricName,
                    metric_attribute_type: type,
                    metric_attribute_name: key,
                    limit: maxNbRecords,
                    contains: search
                });
                
                return this._createDAFilterResponse(attributeValues, selectedValues);
            }

            throw new Error('Unsupported observability type: ' + observability);
        } catch (error) {
            throw error;
        }
    },

    // Private methods

    /**
     * Get metadata payload based on filter type
     * @private
     * @param {string} filterId - Type of filter
     * @param {string} [serviceName] - Optional service name
     * @returns {Object} Metadata payload configuration
     */
    _getMetadataPayload: function(filterId, serviceName) {
        if (filterId === this.FILTER_IDS.SERVICE_NAME) {
            return this._metadataConfig.service_name;
        }

        if ([this.FILTER_IDS.METRIC_NAME, this.FILTER_IDS.METRIC_ATTRIBUTE_VALUE].includes(filterId)) {
            return {
                ...this._metadataConfig.metrics,
                serviceName: serviceName || ''
            };
        }

        throw new Error('Invalid filterId: ' + filterId);
    },

    /**
     * Transform the metadata response based on filter type
     * @private
     * @param {Object} metadataResponse - Raw metadata response
     * @param {string} filterId - Type of filter
     * @param {string} [metricName] - Optional metric name for attribute filtering
     * @returns {Object} Formatted response
     */
    _transformResolutionResponse: function(metadataResponse, filterId, metricName) {
        const responseMap = {
            [this.FILTER_IDS.SERVICE_NAME]: () => 
                this._transformServiceNames(metadataResponse.ServiceNames || []),
            [this.FILTER_IDS.METRIC_NAME]: () => 
                this._transformMetricNames(metadataResponse || []),
            [this.FILTER_IDS.METRIC_ATTRIBUTE_VALUE]: () => 
                this._transformMetricAttributes(metadataResponse || [], metricName)
        };

        const transformFn = responseMap[filterId];
        if (!transformFn) {
            throw new Error('Unsupported filter type: ' + filterId);
        }

        return {
            value: transformFn()
        };
    },

    /**
     * Transform service names to standard format
     * @private
     * @param {Array<Object>} serviceNames - Array of service name objects
     * @returns {Array<Object>} Transformed service names
     */
    _transformServiceNames: function(serviceNames) {
        return (serviceNames || []).map(service => ({
            id: service?.Name,
            label: service?.Name
        })).filter(Boolean);
    },

    /**
     * Transform metric names to standard format
     * @private
     * @param {Array<Object>} metricDetails - Array of metric detail objects
     * @returns {Array<Object>} Transformed metric names
     */
    _transformMetricNames: function(metricDetails) {
        return (metricDetails || []).map(metric => ({
            id: metric?.MetricName,
            label: metric?.MetricName
        })).filter(Boolean);
    },

    /**
     * Transform metric attributes to standard format
     * @private
     * @param {Array<Object>} metricDetails - Array of metric detail objects
     * @param {string} [metricName] - Optional metric name to filter by
     * @returns {Array<Object>} Transformed metric attributes
     */
    _transformMetricAttributes: function(metricDetails, metricName) {
        const attributes = [];

        (metricDetails || [])
            .filter(metric => !metricName || metric?.MetricName === metricName)
            .forEach(metric => {
                (metric?.Attributes || []).forEach(attr => {
                    if (attr?.key) {
                        attributes.push({
                            id: `${attr.type || this.DEFAULT_ATTRIBUTE_TYPE}.${attr.key}`.toString(),
                            label: attr.key
                        });
                    }
                });
            });

        return attributes;
    },

    /**
     * Handle metric attribute metadata request
     * @private
     * @param {string} serviceName - Service name
     * @param {string} metricName - Metric name
     * @param {Array} selectedValues - Array of selected values
     * @param {string} search - Search term
     * @returns {Object} Filtered response
     */
    _handleMetricAttributeMetadata: function(serviceName, metricName, selectedValues = [], search = '') {
        const metadataPayload = {
            ...this._metadataConfig.metrics,
            serviceName: serviceName
        };

        const metadataResponse = new TelemetryDataHandler().getMetadata({
            configuration: metadataPayload
        });

        const metricNames = this._transformResolutionResponse(
            metadataResponse,
            this.FILTER_IDS.METRIC_ATTRIBUTE_VALUE,
            metricName
        );

        const searchValue = (search || '').toLowerCase();
        const filteredResults = metricNames?.value?.filter(item => 
            item?.label?.toLowerCase().includes(searchValue)
        );

        return this._createDAFilterResponse(filteredResults, selectedValues);
    },

    /**
     * Create a standard filter response
     * @private
     * @param {Array} results - Array of result items
     * @param {Array} selectedValues - Array of selected values
     * @returns {Object} Standardized filter response
     */
    _createDAFilterResponse: function(results = [], selectedValues = []) {
        const availableItems = Array.isArray(selectedValues) && selectedValues.length > 0
            ? (results || []).filter(item => selectedValues.includes(item.id))
            : (results || []);

        return {
            value: {
                nextRecordIdx: this.DEFAULT_PAGINATION.NEXT_RECORD_IDX,
                availableElements: availableItems,
                unavailableElements: []
            }
        };
    },

    /**
     * Get metric attribute values from the API
     * @private
     * @param {Object} params - Request parameters
     * @returns {Array<Object>} Array of attribute values
     */
    _getMetricAttributeValues: function(params) {
        try {
            return (new QueryServiceHttpClient().doPost(
                this.API_ENDPOINTS.METRIC_ATTRIBUTE_VALUES, 
                params
            ) || []).map(value => ({
                id: value.toString(),
                label: value
            }));
        } catch (error) {
            return [];
        }
    },

    /**
     * Parse attribute identifier into type and key
     * @private
     * @param {string} input - Input string in format "type.key" or just "key"
     * @returns {Object} Object containing type and key
     */
    _parseAttributeIdentifier: function(input) {
        if (typeof input !== 'string') {
            return {
                type: this.DEFAULT_ATTRIBUTE_TYPE,
                key: ''
            };
        }

        input = input.trim();
        const match = input.match(new RegExp(`^(${this.ATTRIBUTE_TYPES.join('|')})\\.(.+)$`));
        
        if (match) {
            return {
                type: match[1],
                key: match[2]
            };
        }

        return {
            type: this.DEFAULT_ATTRIBUTE_TYPE,
            key: input
        };
    },

    /**
     * Validate required parameters
     * @private
     * @param {Object} params - Parameters to validate
     * @param {Array<string>} requiredParams - Array of required parameter names
     * @throws {Error} If any required parameter is missing or invalid
     */
    _validateParams: function(params, requiredParams = []) {
        if (!params || typeof params !== 'object') {
            throw new Error('Invalid parameters: expected an object');
        }

        const missingParams = requiredParams.filter(param => 
            !params.hasOwnProperty(param) || 
            params[param] === null || 
            params[param] === undefined
        );

        if (missingParams.length > 0) {
            throw new Error('Missing required parameters: ' + missingParams.join(', '));
        }
    },

    type: 'TelemetryDAMetadataHandler'
};
