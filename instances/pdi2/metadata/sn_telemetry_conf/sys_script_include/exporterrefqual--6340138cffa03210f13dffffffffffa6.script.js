var ExporterRefQual = Class.create();
ExporterRefQual.prototype = {
    initialize: function() {},

    getExportersByMetricType: function(metricType) {
        if (!metricType) {
            return 'sys_idISEMPTY';
        }

        var ids = [];
        var gr = new GlideRecord('sn_telemetry_conf_exporter');
        gr.addActiveQuery();
        gr.addQuery('supported_metric_types', 'CONTAINS', metricType);
        gr.query();

        while (gr.next()) {
            var types = (gr.getValue('supported_metric_types') || '').split(',');
            for (var i = 0; i < types.length; i++) {
                if (types[i].trim() === metricType.trim()) {
                    ids.push(gr.getValue('sys_id'));
                    break;
                }
            }
        }

        return ids.length === 0 ? 'sys_idISEMPTY' : 'sys_idIN' + ids.join(',');
    },

    type: 'ExporterRefQualUtil'
};
