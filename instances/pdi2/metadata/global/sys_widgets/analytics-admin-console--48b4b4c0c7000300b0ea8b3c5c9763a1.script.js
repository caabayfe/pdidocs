function sections() {
	return {
			'Widgets' : {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '8bac43f1c7000300b0ea8b3c5c97632f',
				'target_table': 'pa_widgets',
				'applied_field': 'sys_id_filter_',
				'record_type': 'widgets',
				'sysparm_processor': 'getWidgetRecords',
				'renderer_name': 'com.snc.pa.ui.RenderPerformanceAnalytics'
			}, 
			'Indicators' : {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '90899806c7400300b0ea8b3c5c976364',
				'applied_field': 'sys_id_filter_',
				'target_table': 'pa_indicators',
				'record_type': 'indicator',
				'sysparm_processor': 'getWidgetsDetails'
			}, 
			'Indicator Sources' : {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '89cdd8e6c7100300b0ea8b3c5c9763fa',
				'applied_field': 'sys_id_filter_',
				'target_table': 'pa_cubes',
				'record_type': 'indicator_source',
				'sysparm_processor': 'getWidgetsDetails'
			},
			'Breakdowns': {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': 'b7642c8ac7400300b0ea8b3c5c97630e',
				'target_table': 'pa_breakdowns',
				'applied_field': 'sys_id_filter_',
				'record_type': 'breakdown',
				'sysparm_processor': 'getWidgetsDetails'
			},
			'Breakdown Sources': {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '7bf73896c7800300b0ea8b3c5c97635e',
				'target_table': 'pa_dimensions',
				'applied_field': 'sys_id_filter_',
				'record_type': 'breakdown_source',
				'sysparm_processor': 'getWidgetsDetails'
			}, 
			'Jobs' : {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '46cedce6c7100300b0ea8b3c5c976324',
				'applied_field': 'sys_id_filter_',
				'target_table': 'sysauto_pa',
				'record_type': 'indicator_jobs',
				'sysparm_processor': 'getWidgetsDetails'
			}, 
			'Reports' : {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '2735180b0b2003002050eddc83673a6a',
				'applied_field': 'sys_id_filter_',
				'target_table': 'sys_report',
				'record_type': 'report',
				'sysparm_processor': 'getWidgetsDetails'
			}, 
			'Interactive Filters' : {
				'name' : '$admin_console_reports',
				'type' : 'report',
				'report_id': '91c5980b0b2003002050eddc83673ac2',
				'applied_field': 'sys_id_filter_',
				'target_table': 'sys_ui_hp_publisher',
				'record_type': 'interactive_filter',
				'sysparm_processor': 'getWidgetsDetails'
			}, 
			'Indicator - Table' : {
				'name' : 'homepage_publisher.xml',
				'type' : 'interactive_filter',
				'filter_type': 'indicator', 
				'ui_control_type': 'select_multiple',
				'display_name': 'Fact Table',
				'default_values': '{}',
				'default_config': '{\'config\': []}',
				'sys_id': guid(),
				'is_custom_interactive_filter': "true"
			},
			'Report - Table' : {
				'name' : 'homepage_publisher.xml',
				'type' : 'interactive_filter',
				'filter_type': 'report', 
				'ui_control_type': 'select_multiple',
				'display_name': 'Fact Table',
				'default_values': '{}',
				'default_config': '{\'config\': []}',
				'sys_id': guid(),
				'is_custom_interactive_filter': "true"
			}, 
			'Breakdown - Table' : {
				'name' : 'homepage_publisher.xml',
				'type' : 'interactive_filter',
				'filter_type': 'breakdown',
				'ui_control_type': 'select_multiple',
				'display_name': 'Fact Table',
				'default_values': '{}',
				'default_config': '{\'config\': []}',
				'sys_id': guid(),
				'is_custom_interactive_filter': "true"
			}
		
		};
	}
	
	function render() {
		var name = renderer.getPreferences().get("name");
		var type = renderer.getPreferences().get("type");
		if(type == 'report') {
			var reportId = renderer.getPreferences().get("report_id");
			var renderer_name = renderer.getPreferences().get("renderer_name");
			var targetTable = renderer.getPreferences().get("target_table");
			var sysparmProcessor = renderer.getPreferences().get("sysparm_processor");
			var appliedField = renderer.getPreferences().get("applied_field");
			var recordType = renderer.getPreferences().get("record_type");
			var jr = new GlideJellyRunner();
			renderer.getRenderProperties().setDeferInlineScripts(false);
			jr.setRenderProperties(renderer.getRenderProperties());
			jr.setTwoPhase(true);
			jr.setVariable('jvar_uid', randInt(100000, 999999) + '' + randInt(100000, 999999));
			jr.setVariable('jvar_report_id', reportId);
			jr.setVariable('jvar_target_table', targetTable);
			jr.setVariable('jvar_sysparm_processor', sysparmProcessor);
			jr.setVariable('jvar_renderer', renderer_name);
			jr.setVariable('jvar_applied_field', appliedField);
			jr.setVariable('jvar_record_type', recordType);
			
			return jr.runFromTemplate(name);
		} else if(type == 'interactive_filter') {
			var uiControlType = renderer.getPreferences().get("ui_control_type");
			var displayName = renderer.getPreferences().get("display_name");
			var sysId = renderer.getPreferences().get("sys_id");
			var filterType = renderer.getPreferences().get("filter_type");
			
			var jr2 = new GlideJellyRunner();
			var tableString = new SNC.InteractiveFilterUtils().getTables();
			var jsonData = new JSONParser();
			var tables = jsonData.parse(tableString);
			var glideRecord;
			var publisherConfig;
			var columnName = 'facts_table';
			if(filterType == "indicator") {
				publisherConfig ='{"isPublisher":"true","filterType":"1","config":[{"st":"pa_cubes","sf":"facts_table","id":"5a03494dc730030020508b3c5c9763ac","allow_extended_table":false},	{"st":"pa_indicators","sf":"cube.facts_table","id":"5a03494dc730030020108b3c5c9763ac","allow_extended_table":false}]}';
				glideRecord = new GlideAggregate("pa_cubes");
				glideRecord.addAggregate('COUNT', 'facts_table');
				glideRecord.addQuery("benchmarking", 0).addOrCondition("benchmarking", 'null');
				glideRecord.query();
			} else if(filterType == "breakdown") {
				publisherConfig ='{"isPublisher":"true","filterType":"1","config":[{"st":"pa_dimensions","sf":"facts_table","id":"5a03494dc730030020508b3c5c9763ac","allow_extended_table":false},	{"st":"pa_breakdowns","sf":"dimension.facts_table","id":"5a03494dc730030020108b3c5c9763ac","allow_extended_table":false}]}';
				glideRecord = new GlideAggregate("pa_dimensions");
				glideRecord.addAggregate('COUNT', 'facts_table');
				glideRecord.query();
			} else if(filterType == "report") {
				publisherConfig ='{"isPublisher":"true","filterType":"1","config":[{"st":"sys_report","sf":"table","id":"5a03494dc730030020508a3c5c9763ac","allow_extended_table":false}]}';
				glideRecord = new GlideAggregate("sys_report");
				glideRecord.addAggregate('COUNT', 'table');
				glideRecord.query();
				columnName = 'table';
			}
			
			var cl = new GlideChoiceList();
			while(glideRecord.next()) {
				var tableName = glideRecord[columnName];
				for(var i = 0; i < tables.length; i++) {
					if(tableName == tables[i].name) {
						cl.add(tables[i].name, tables[i].label);
						break;
					}
				}
			}
			renderer.getRenderProperties().setDeferInlineScripts(false);
			jr2.setRenderProperties(renderer.getRenderProperties());
			jr2.setTwoPhase(true);
			jr2.setVariable('jvar_ui_control_type', uiControlType);
			jr2.setVariable('jvar_choices', cl);
			jr2.setVariable('jvar_name', displayName);
			jr2.setVariable('jvar_publisher_config', publisherConfig);
			jr2.setVariable('ref', sysId);
			return jr2.runFromTemplate(name);
		} else {
			var gf = new GlideForm(renderer.getGC(), name, 0);
			gf.setDirect(true);
			gf.setRenderProperties(renderer.getRenderProperties());
			return gf.getRenderedPage();
		}
	}
	
	function getEditLink() {
		var type = renderer.getPreferences().get("type");
		if(type == 'report')
			return "sys_report_template.do?jvar_report_id=" + renderer.getPreferences().get("report_id");
		else
			return "sys_widgets.do?sys_id=48b4b4c0c7000300b0ea8b3c5c9763a1";
	}

	function randInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function guid() {
	  function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	}
