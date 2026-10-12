(function() {
	var statsApi = sn_ex_emp_fd.PortalPerformanceStatsManager !== undefined;	
	var manager = null;
	if (statsApi) {
		manager = new sn_ex_emp_fd.PortalPerformanceStatsManager();
		data.statsEnabled = (manager.sessionDebugStatus() === 'true');
	}
	data.statsApi = statsApi;
	data.isAdmin = gs.hasRole('sn_hr_sp.esc_admin');
	data.userData = [];	
	data.userName = gs.getUserDisplayName();

	data.msg = {			
		disableStats: gs.getMessage('Disable Performance Stats'),
		enableStats: gs.getMessage('Enable Performance Stats'),
		yes: gs.getMessage('Yes'),
		no: gs.getMessage('No'),
		instance: gs.getMessage('(Instance title not set)'),
		noServerTime: gs.getMessage('No server time available')
	};	
	var categories = {
		0: gs.getMessage('Out of the box'),
		1: gs.getMessage('Out of the box'),
		2: gs.getMessage('Cloned'),
		3: gs.getMessage('Brand new'),
		4: gs.getMessage('Customized')
	};

	if (input) {
		if (input.action =='getUserData') {
			var widgetData = input.widgets;
			var widgetMap = {};

			// Initialize the widgetMap with default blank values
			widgetData.forEach(function(widget) {
				widget.first_load_time_ms = '';
				widget.first_load_time_sys_id = '';
				if (gs.nil(widget.rectangle) || "undefined" == widget.rectangle) {
					widgetMap[widget.sys_id] = widget;
				}
				else {
					widgetMap[widget.rectangle] = widget;
				}
			});

			var gr = new GlideRecordSecure('sn_ex_emp_fd_portal_performance_stats');
			var query = "ran_for_user="+input.sysId+"^caller_table=sp_widget^ORcaller_table=sp_instance^parent_idISEMPTY^session_id="+ gs.getSessionID();
			gr.addEncodedQuery(query, false);
			gr.orderByDesc('sys_created_on');
			gr.query();

			var callerMap = {}; // Object to store the most recent record for each caller_id
			while (gr.next()) {
				var rectangle = gr.getValue('caller_id');
				if (!callerMap[rectangle]) {
					callerMap[rectangle] = {
						execution_time: gr.getValue('execution_time'),
						sys_id: gr.getValue('sys_id')
					};
				}
			}

			// Update widgetMap with the most recent records
			for (var instance in callerMap) {
				if (widgetMap[instance]) {
					widgetMap[instance].first_load_time_ms = callerMap[instance].execution_time;
					widgetMap[instance].first_load_time_sys_id = callerMap[instance].sys_id;
				}
			}
			data.newWidgets = widgetData;
		}

		if (input.action == 'getData') {
			var widgets = input.widgets;
			var widgetIds = [];

			// Initialize all widgets with a default category and populate widgetMap
			widgets.forEach(function(widget) {
				var title = "";
				if (gs.nil(widget.rectangle) || "undefined" == widget.rectangle){
					var grWid = new GlideRecordSecure('sp_widget');
					if (grWid.get(widget.sys_id)) {
						title = grWid.getValue('title');
					}
				} else {
					var grInstance = new GlideRecordSecure('sp_instance');
					if (grInstance.get(widget.rectangle)) {
						title = grInstance.getValue('title');
					}
				}
				widget.instance_title = title;
				widgetIds.push(widget.sys_id);
				widget.category = categories[0]; // Default to 'OOB'
			});

			var widgetDetails = new global.SPDiagnosticsDriver().categorizeInstances(widgetIds);

			// Update categories based on the widgetDetails
			widgets.forEach(function(widget) {
				for(var widget_id in widgetDetails) {
					if (widgetDetails.hasOwnProperty(widget_id) && widget.sys_id === widget_id) {
						widget.category = categories[widgetDetails[widget_id].widgetCustDetails.category];
					}
				}
			});

			data.newWidgets = widgets;
		}

		if (statsApi && input.action == 'toggleStats') {
			if (input.value === true) {
				manager.enableLogging(true);
			} else {
				manager.disableLogging();
			}
		}
		return;
	}
})();
