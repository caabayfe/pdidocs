var SurveyReportingScript = Class.create();
SurveyReportingScript.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	hideSurveyResultsAction: function(metricId) {
		// increasing these might impact performance
		var INSTANCE_LIMIT = 100000; 
		var METRICS_LIMIT = 5;
		
		var metricGr = new GlideRecord('asmt_metric');
		metricGr.addQuery('metric_type', metricId);
		metricGr.addActiveQuery();
		metricGr.query();
		if (metricGr.getRowCount() > METRICS_LIMIT) return true;
		
		
		var gr = new GlideRecord('asmt_assessment_instance');
		gr.addQuery('metric_type', metricId);
		gr.query();
		return gr.getRowCount() > INSTANCE_LIMIT;
	},
	
	generateViewFields: function(viewTable, fields) {
		fields.forEach(function(field) {
			var gr = new GlideRecord('sys_db_view_table_field');
			gr.initialize();
			gr.view_table = viewTable.getUniqueValue();
			gr.table = viewTable.table;
			gr.field = field;
			gr.insert();
		});
	},
	
	generateResultsView : function() {
		var metricId = this.getParameter('sysparm_metric_id');
		this.generateResults(metricId);
		return true;
	},
	
	generateResults: function(metricTypeId) {
		if (!metricTypeId || !(new AssessmentUtils().canViewScoreCardPage(metricTypeId))) return;
		var LIST_LIMIT = 8;
		var order = 0;
		
		var gr = new GlideRecord('asmt_metric_type');
		var dbName = 'u_metric_' + metricTypeId + '_result';
		if (gr.get(metricTypeId)) {
			var survey = gr.name + '';
			var listElems = [];
			
			var dbView = new GlideRecord('sys_db_view');
			dbView.addQuery('name', dbName);
			dbView.query();
			if (dbView.next())
				return; //dont create if dbview already exists
			
			dbView.initialize();
			dbView.name = dbName;
			dbView.label = gs.getMessage('{0} Results', [survey]);
			dbView.insert();
			
			//instance Table
			var dbTable = new GlideRecord('sys_db_view_table');
			dbTable.initialize();
			dbTable.table = 'asmt_assessment_instance';
			dbTable.variable_prefix = 'inst';
			dbTable.order = order = order + 100;
			dbTable.view = dbView.getUniqueValue();
			dbTable.where_clause = "inst_metric_type='" + metricTypeId + "'" + " && inst_state = 'complete'";
			dbTable.insert();
			
			//instance table Fields
			this.generateViewFields(dbTable, ['number', 'taken_on', 'due_date', 'user', 'metric_type', 'expiration_date', 'task_id', 'sys_created_on','state']);
			
			//add instance fields to list view
			listElems.push('inst_number');
			listElems.push('inst_user');
			listElems.push('inst_task_id');
			
			//Add user table to DB view
			dbTable = new GlideRecord('sys_db_view_table');
			dbTable.initialize();
			dbTable.table = 'sys_user';
			dbTable.variable_prefix = 'us';
			dbTable.order = order = order + 100;
			dbTable.view = dbView.getUniqueValue();
			dbTable.where_clause = "us_sys_id=inst_user";
			dbTable.insert();
			this.generateViewFields(dbTable, ['sys_id']);
			
			var questions = new GlideRecord('asmt_metric');
			questions.addActiveQuery();
			questions.addQuery('metric_type', metricTypeId);
			questions.orderBy('order');
			questions.query();
			var i = 0;
			while (questions.next()) {
				i++;
				var varPrefix = 'res' + i;
				dbTable = new GlideRecord('sys_db_view_table');
				dbTable.initialize();
				dbTable.table = 'asmt_metric_result';
				dbTable.variable_prefix = varPrefix;
				dbTable.where_clause = "inst_sys_id=" + varPrefix + "_instance && "
										+ varPrefix + "_metric='" + questions.getUniqueValue() + "'";
				dbTable.left_join = true;
				dbTable.order = order = order + 100;
				dbTable.view = dbView.getUniqueValue();
				dbTable.insert();
				//add fields
				this.generateViewFields(dbTable, ['instance', 'metric', 'source_id', 'source_table', 'string_value']);
				//add label
				var doc = new GlideRecord('sys_documentation');
				doc.initialize();
				doc.name = dbName;
				doc.label = questions.question.getDisplayValue();
				doc.element = varPrefix + "_string_value";
				doc.language = 'en';
				doc.insert();
				
 				listElems.push(varPrefix + "_string_value");
			}
			
			//Update UI List
			var uiList = new GlideRecord('sys_ui_list');
			uiList.addQuery('name', dbName);
			uiList.addQuery('view', 'Default view');
			uiList.query();
			if (uiList.next()) {
				var listElement = new GlideRecord('sys_ui_list_element');
				listElement.addQuery('list_id', uiList.getUniqueValue());
				listElement.deleteMultiple();
			} else {
				uiList.initialize();
				uiList.name = dbName;
				uiList.view = 'Default view';
				uiList.insert();
			}
			
			for (var i=0; i < listElems.length && i < LIST_LIMIT; i++) {
				var elem = listElems[i];
				var listElement = new GlideRecord('sys_ui_list_element');
				listElement.initialize();
				listElement.list_id = uiList.getUniqueValue();
				listElement.position = i;
				listElement.element = elem;
				listElement.insert();
			}
			
			var listControl = new GlideRecord('sys_ui_list_control');
			listControl.initialize();
			listControl.name = dbName;
			listControl.omit_new_button = true;
			listControl.omit_count = true;
			listControl.insert();
		}
	},
    type: 'SurveyReportingScript'
});
