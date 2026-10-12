var ScanAjaxProcessor = Class.create();
ScanAjaxProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	SUCCESS_CODE: 0,
	FAILED_CODE: 1,

	executeScan: function(func) {
		try {
			return JSON.stringify({ status: this.SUCCESS_CODE, progressId: func() });
		} catch (e) {
			return JSON.stringify({ status: this.FAILED_CODE, message: e.message });
		}
	},

	collectUsageMetricWithParam: function() {
		var event = this.getParameter("sysparm_metric_event");
		this.collectUsageMetric(event);
	},

	collectUsageMetric: function(event) {
		var sampleMap = new GCFSampleMap();
		sampleMap.put('event_name', '' + event);
		GCFCollector.recordUsageEvent('custom_metric', 'instance_scan_suite', 'instance_scan_suite_event', sampleMap);
	},

	executeTestScan: function() {
		this.collectUsageMetric('scan_instance_ajax_test_scan');
		var sysId = this.getParameter("sysparm_sys_id");
		var tableName = this.getParameter("sysparm_table_name");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerTestScan(sysId, tableName);
		});
	},

	executePointScan: function() {
		this.collectUsageMetric('scan_instance_ajax_point_scan');
		var sysId = this.getParameter("sysparm_sys_id");
		var tableName = this.getParameter("sysparm_table_name");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerPointScan(tableName, sysId);
		});
	},

	executeSuiteScan: function() {
		this.collectUsageMetric('scan_instance_ajax_suite_scan');
		var sysId = this.getParameter("sysparm_sys_id");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerSuiteScan(sysId);
		});
	},

	executeUpdateSetScan: function() {
		this.collectUsageMetric('scan_instance_ajax_update_set_scan');
		var sysId = this.getParameter("sysparm_sys_id");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerUpdateSetScan(sysId);
		});
	},

	executeUpdateSetBatchScan: function() {
		this.collectUsageMetric('scan_instance_ajax_update_set_batch_scan');
		var sysId = this.getParameter("sysparm_sys_id");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerUpdateSetBatchScan(sysId);
		});
	},

	executeAppScan: function() {
		this.collectUsageMetric('scan_instance_ajax_app_scan');
		var scopeId = this.getParameter("sysparm_scope_id");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerAppScan(scopeId);
		});
	},

	executeFullScan: function() {
		this.collectUsageMetric('scan_instance_ajax_full_instance_scan');
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerFullScan();
		});
	},

	cancelScan: function() {
		this.collectUsageMetric('scan_instance_cancel_instance_scan');
		var progressId = this.getParameter("sysparm_progress_id");
		return new sn_instance_scan.ScanInstance().cancelScan(progressId, false);
	},

	executeScanFromCombo: function() {
		this.collectUsageMetric('scan_instance_ajax_from_combo_scan');
		var comboId = this.getParameter("sysparm_combo_id");
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerScanFromCombo(comboId);
		});
	},

	executeSuiteScanWithTargets: function() {
		this.collectUsageMetric('scan_instance_ajax_suite_with_targets_scan');
		var comboId = this.getOrCreateCombo();
		return this.executeScan(function() {
			return new sn_instance_scan.ScanInstance().triggerScanFromCombo(comboId);
		});
	},

	getOrCreateCombo: function() {
		var suiteId = this.getParameter('sysparm_suite_sys_id');
		var targetTable = this.getParameter('sysparm_target_table');
		var targetIds = JSON.parse(this.getParameter('sysparm_target_sys_ids'));

		if(targetTable == 'sys_update_set') {
			return new sn_instance_scan.ScanUtil().getOrCreateComboForSuiteAndUpdateSetBatch(suiteId, targetTable, targetIds);
		}

		return new sn_instance_scan.ScanUtil().getOrCreateComboFromSuiteAndTargets(suiteId, targetTable, targetIds);
	},

	hasActiveChecksInSuiteTree: function() {
		var scan = new sn_instance_scan.SuiteTree(this.getParameter("sysparm_suite_sys_id"));
		return scan.hasActiveChecksInSuiteTree();
	},

	_createResponse: function(status, message) {
		return JSON.stringify({ status: status, message: message });
	},

    type: 'ScanAjaxProcessor'
});
