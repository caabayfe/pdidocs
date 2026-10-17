var TelemetryExporterValidator = Class.create();
TelemetryExporterValidator.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getValidExporters: function() {
        var result = {
            valid: [],
            invalid: []
        };

        var metricType = this.getParameter('sysparm_metric_type');
        var exporterList = this.getParameter('sysparm_exporter_list');

        if (!metricType || !exporterList) {
            return result;
        }

        var exporterIds = exporterList.split(',');

        for (var i = 0; i < exporterIds.length; i++) {
            var exporterId = exporterIds[i].trim();
            if (!exporterId) {
                continue;
            }

            if (this._isExporterValidForType(exporterId, metricType)) {
                result.valid.push(exporterId);
            } else {
                result.invalid.push(exporterId);
            }
        }

        return JSON.stringify(result);
    },

    /**
     * Check if an exporter is valid for a specific metric type
     * @param {String} exporterId - The sys_id of the exporter
     * @param {String} metricType - The type of metric
     * @return {Boolean} True if the exporter supports the metric type
     */
    _isExporterValidForType: function(exporterId, metricType) {
        var gr = new GlideRecordSecure('sn_telemetry_conf_exporter');
        if (!gr.get(exporterId)) {
            return false;
        }

        var supportedTypes = gr.getValue('supported_metric_types');
        if (!supportedTypes) {
            return false;
        }

        // Check if the metric type is in the list of supported types
        return supportedTypes.split(',').includes(metricType);
    },

    type: 'TelemetryExporterValidator'
});
