var MLUtils = Class.create();
MLUtils.prototype = {
    initialize: function() {},

    getTopDistribution: function(solution, number) {
        var sysIDs = [];
        var gr = new GlideRecord('ml_class');
        gr.addQuery('solution', solution);
        gr.orderByDesc('distribution');
        gr.setLimit(number);
        gr.query();
        var i = 0;
        while (gr.next()) {
            sysIDs.push(gr.sys_id + '');
        }
        return sysIDs;
    },

    getRequestMetaData: function() {
        var request_metadata;
		
        if ('populateMetadata' in sn_ml.MLRecordUtil) {
            request_metadata = sn_ml.MLRecordUtil.populateMetadata();
        } else {
            request_metadata = {
                "instance_name": gs.getProperty("instance_name"),
                "instance_version": "",
                "instance_id": gs.getProperty("instance_id"),
                "node_id": "",
                "system_id": "",
                "solution_capability": "",
                "solution_name": "",
                "solution_id": "",
                "trace_id": gs.generateGUID(),
                "mluc_id": "",
            };

            var versions = {
                "Kingston": "13",
                "London": "14",
                "Madrid": "15",
                "New York": "16",
                "Orlando": "17",
                "Paris": "18",
                "Quebec": "19",
                "Rome": "20",
                "Sandiego": "21",
                "tokyo": "22",
                "utah": "23",
                "vancouver": "24"
            };

            var version = gs.getProperty("com.glide.embedded_help.version");
            if (version in versions)
                request_metadata.instance_version = versions[version];
        }
		return request_metadata;
    },

    type: 'MLUtils'
};
