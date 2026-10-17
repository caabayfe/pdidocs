var MetricLicensingUtil = Class.create();
MetricLicensingUtil.prototype = {
    initialize: function() {
    },

    type: 'MetricLicensingUtil'
};

MetricLicensingUtil.getCount = function() {
	var ciList = {};
	
	getCisFromTrackerAndMapForServers();
	getCisFromTrackerAndMapForNetworkAdapters();
	
	return Object.keys(ciList).length;

	function getCisFromTrackerAndMapForNetworkAdapters() {
		//Get from metric map
		getFromMetricMap('cmdb_ci_network_adapter', 'cmdb_ci.cmdb_ci');
	
		//Get from tracker
		getFromTracker('cmdb_ci_network_adapter', 'cmdb_ci');
	}

	function getCisFromTrackerAndMapForServers() {
		//Get from metric map
		getFromMetricMap('cmdb_ci_server', 'cmdb_ci');
	
		//Get from tracker
		getFromTracker('cmdb_ci_server', 'sys_id');
	}

	function getFromMetricMap(ciClassName, colName) {
		var gr = new GlideRecord('sa_metric_map');
		gr.addQuery('active', true);
		gr.addNotNullQuery('cmdb_ci');
		gr.addJoinQuery(ciClassName, 'cmdb_ci', 'sys_id');
		gr.query();

		while(gr.next()) {
			var ci = gr.getValue(colName);
			if(ci != null && !ciList.hasOwnProperty(ci)) {
				ciList[ci] = true;
			}
		}
	}

	function getFromTracker(ciClassName, colName) {
		//Get from tracker
		var gr = new GlideRecord(ciClassName);
		gr.addJoinQuery('sa_metric_ci_tracker', 'sys_id', 'cmdb_ci');
		gr.query();
	
		while(gr.next()) {
			var ci = gr.getValue(colName);
			if(ci != null && !ciList.hasOwnProperty(ci)) {
				ciList[ci] = true;
			}
		}
	}
	
};
