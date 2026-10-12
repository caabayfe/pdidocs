(function executeRule(current, previous /*null when async*/) {
	gs.log(current);
	gs.log(previous);

	var tableName = 'sys_ui_style';
	
	if (current.context_color_code !== previous.context_color_code) {
		var currentContextId = current.context_id;
		var sysIds = getSysIds();
		var iconStyle = getIconStyle();
		
		var gr = new GlideRecord(tableName);
		gr.addQuery('sys_id','IN', sysIds);
		gr.query();
		while(gr.next()) {
			var colorStyle = getColorStyle(current);
			gr.style = colorStyle + ' ' + iconStyle;
			gr.update();
		}		
	}

	function getColorStyle(currentRecord) {
		return 'background-color: ' + currentRecord.context_color_code + ';';
	}

	function getIconStyle() {
		return 'background-image: url("/transparent severity icon.png");';
	}

	// Turns Sys Ids object into an comma delimited string
	function getSysIds() {
	 	var sysIds = [];
		var glideRecordsSysIds = initSeverityArraysWithSysIds();
		for (var i = 0; i < glideRecordsSysIds[currentContextId].length; i++) {
			var sysId = glideRecordsSysIds[currentContextId][i].sys_id;
			sysIds.push(sysId);
		}
		return sysIds.join();
	}

	// Object contains all sys-ids by their relevant table
	function initSeverityArraysWithSysIds () {
		var tablesList = getTablesList();

		return {
			critical_severity: [
				{table: tablesList[0], sys_id: '962c052f7f6b220002d31ccebefa91a3'},
				{table: tablesList[1], sys_id: 'e8a415b1eb11110045e1a5115206fed7'},
				{table: tablesList[2], sys_id: 'f6048c3f93102200a45a76df067ffbc7'},
				{table: tablesList[3], sys_id: 'b1cf9272534231001c1379e5a11c0863'},
				{table: tablesList[4], sys_id: '3248f40593210200725d3b5b357ffbca'},
				{table: tablesList[5], sys_id: 'a923765693332200833b76df067ffbdb'},
			],
			major_severity: [
				{table: tablesList[0], sys_id: '4a4c052f7f6b220002d31ccebefa91cd'},
				{table: tablesList[1], sys_id: '23b415b1eb11110045e1a5115206fef4'},
				{table: tablesList[2], sys_id: 'f0248c3f93102200a45a76df067ffbc4'},
				{table: tablesList[3], sys_id: '6fcf9272534231001c1379e5a11c0887'},
				{table: tablesList[4], sys_id: 'd658f40593210200725d3b5b357ffbbd'},
				{table: tablesList[5], sys_id: 'd5c472d693332200833b76df067ffb43'},
			],
			minor_severity: [
				{table: tablesList[0], sys_id: '515c852f7f6b220002d31ccebefa91d3'},
				{table: tablesList[1], sys_id: 'dfd455b1eb11110045e1a5115206fe2b'},
				{table: tablesList[2], sys_id: '3044cc3f93102200a45a76df067ffb7c'},
				{table: tablesList[3], sys_id: '09df9272534231001c1379e5a11c0889'},
				{table: tablesList[4], sys_id: '2a68f40593210200725d3b5b357ffb0e'},
				{table: tablesList[5], sys_id: 'd8d472d693332200833b76df067ffb48'},
			],
			warning_severity: [
				{table: tablesList[0], sys_id: '146c852f7f6b220002d31ccebefa916d'},
				{table: tablesList[1], sys_id: 'd86e2573eb1211004d7763fba206fefc'},
				{table: tablesList[2], sys_id: '8154cc3f93102200a45a76df067ffbab'},
				{table: tablesList[3], sys_id: 'f2df9272534231001c1379e5a11c08ae'},
				{table: tablesList[4], sys_id: '4a78380593210200725d3b5b357ffb29'},
				{table: tablesList[5], sys_id: 'cce472d693332200833b76df067ffb4b'},
			],
			information_severity: [
				{table: tablesList[0], sys_id: 'db6cc52f7f6b220002d31ccebefa91c6'},
				{table: tablesList[0], sys_id: 'cbcb8deb7f6b220002d31ccebefa91dd'},
				{table: tablesList[1], sys_id: '0a38a37093933100f046987a357ffb26'},
				{table: tablesList[1], sys_id: '6f2555b1eb11110045e1a5115206feb0'},
				{table: tablesList[2], sys_id: '5864cc3f93102200a45a76df067ffbfd'},
				{table: tablesList[2], sys_id: '02f38c3f93102200a45a76df067ffb55'},
				{table: tablesList[3], sys_id: '71202672534231001c1379e5a11c0875'},
				{table: tablesList[3], sys_id: '3bbf5272534231001c1379e5a11c08ce'},
				{table: tablesList[4], sys_id: '6d88380593210200725d3b5b357ffb2a'},
				{table: tablesList[4], sys_id: '6f38f40593210200725d3b5b357ffbb7'},
				{table: tablesList[5], sys_id: '03e4b2d693332200833b76df067ffbd1'},
				{table: tablesList[5], sys_id: '74f4f2d693332200833b76df067ffb54'},
			]
		};
	}

	function getTablesList() {
		return [
			'cmdb_ci_service_auto',
			'em_alert',
			'em_alert_anomaly',
			'em_alert_history',
			'query_based_service',
			'sa_rca_group_view'
		];
	}
	
	

})(current, previous);
