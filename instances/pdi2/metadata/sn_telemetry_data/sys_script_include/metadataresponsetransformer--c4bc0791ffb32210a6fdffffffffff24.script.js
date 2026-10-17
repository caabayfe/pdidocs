var MetadataResponseTransformer = Class.create();
MetadataResponseTransformer.prototype = {
    initialize: function() {},

    transform: function(data, telemetryDTO) {
        try {
            let responseArray = data;
            if (typeof data === 'string') {
                responseArray = JSON.parse(data);
            }

            if (!Array.isArray(responseArray)) {
                gs.warn("Expected array response, got: " + typeof responseArray);
                return responseArray;
            }

            // Query ALL aggregations from the config table ONCE
            var allAggregations = this._getAllAggregationsFromConfig();

            // Transform the response array with dynamic aggregations
            const transformedData = this._transformAggregations(responseArray, allAggregations);

            return transformedData;

        } catch (ex) {
            gs.error("Transform function error: " + ex.message);
            return data;
        }
    },

    _getAllAggregationsFromConfig: function() {
        var allAggregations = [];
        try {
            var gr = new GlideRecord('sn_telemetry_aggregation_config');
            gr.query();

            while (gr.next()) {
                allAggregations.push({
                    uiAggregation: gr.getValue('ui_aggregation'),
                    metricType: gr.getValue('metric_type'),
                    aggregationColumn: gr.getValue('aggregation_column')
                });
            }
        } catch (ex) {
            gs.error("Error querying sn_telemetry_aggregation_config table: " + ex.message);
        }
        return allAggregations;
    },

    _transformAggregations: function(responseArray, allAggregations) {
        return responseArray.map(metricObject => {
            const transformedMetric = Object.assign({}, metricObject);
            const metricType = transformedMetric.MetricType;

            const supportedAggregations = this.getAggregationsForMetricType(metricType, allAggregations);
            transformedMetric.SupportedAggregations = supportedAggregations;

            return transformedMetric;
        });
    },

    getAggregationsForMetricType: function(metricType, allAggregations) {
        var aggregations = {
            basic: [],
            percentiles: []
        };

        allAggregations.forEach(aggConfig => {
            if (aggConfig.metricType === metricType) {
                var aggColumn = aggConfig.aggregationColumn;

                if (aggColumn.startsWith('P')) {
                    aggregations.percentiles.push(aggConfig.uiAggregation);
                } else {
                    aggregations.basic.push(aggConfig.uiAggregation);
                }
            }
        });

        aggregations.basic.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        return aggregations;
    },

    type: 'MetadataResponseTransformer'
};
