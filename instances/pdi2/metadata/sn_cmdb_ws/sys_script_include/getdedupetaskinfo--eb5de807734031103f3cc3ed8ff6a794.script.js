var GetDedupeTaskInfo = Class.create();
GetDedupeTaskInfo.prototype = {
    initialize: function() {
    },

	showOnlyOpenTasks: function() {
		var property = 'sn_cmdb_ws.dedupetemplate.show_only_open_task';
		var showOnlyOpenTasks = gs.getProperty(property, true);
		if (showOnlyOpenTasks == 'true')
			return true;
		return false;
	},

	/*
		Initialize the task item structure for both user associated and matching task methods
	*/
	_initializeTaskItem: function() {
		var item = {
			sysId: '',
			number: {
				label:'',
				level: 3
			},
			short_description: {
				label: ''
			},
			ci_count: {
				label: gs.getMessage('CI Count'),
				value: 0,
				data: {}
			},
			sources: {
				label: gs.getMessage('Sources'),
				value: []
			}
		};
		return item;
	},
	
	/*
		Get the structured count data for CI Count components
	*/
	_getCiCountData: function(count, label) {
		var data = [{
			"data": [
				{
					"value": count,
				}
			],
			"metadata": {
				"dataSourceLabel": label,
				"aggregate": {
					"fieldType": "decimal"
				},
				"format": {
					"unitFormat": "{0}",
					"frequency": "daily",
					"precision": 0,
				}
			}
		}];

		return data;
	},

	/*
		Get the discovery sources of the CI's in the task.
		
		Only get the sources if the table is a CMDB table
	*/
	getSources: function(taskId) {
		var gr = new GlideRecord('duplicate_audit_result');
		gr.addQuery('follow_on_task', taskId);
		gr.query();

		var sources = [];
		while (gr.next()) {
			var ciSysId = gr.getValue('duplicate_ci');
			var table = gr.getValue('table');

			if (table !== 'cmdb_ci') {
				break;
			}

			var grLookup = new GlideRecord(table);
			if (grLookup.get(ciSysId)) {
				var source = grLookup.getValue('discovery_source');
				if (source != null && source !== 'Unknown' && (sources.indexOf(source) < 0)) {
					sources.push(source);
				}
			}
		}
		return sources;
	},

	/*
		Get information related to a given task directly from reconcile_duplicate_task.

		Item passed to this function are a result from a query where we already are filtering the tasks.
	*/
	getTaskInfo: function(gr) {
		var item = this._initializeTaskItem();

		var taskId = gr.getValue('sys_id');
		item.sysId = taskId;
		item.number.label = gr.getValue('number');
		item.short_description = {
			label: gr.getValue('short_description')
		};
		
		var count = gr.getValue('duplicate_count');
		item.ci_count.value = count;
		item.ci_count.data = this._getCiCountData(count, item.ci_count.label);

		var sources = {
			value: this.getSources(taskId)
		};
		item.sources.value = sources;

		return item;
	},

	/*
		Get matching tasks based on the calculated table where template=<templateSysId>
	*/
	getMatchingTasks: function(template, search) {
		if (!template || template.length == 0) {
			return [];
		}

		var limit = gs.getProperty('sn_cmdb_ws.dedupetemplate.max_task_query_limit');

		// if limit is not set or it is set to an invalid value, go with the default value of 50
		if (!limit || limit <= 0 ) {
			limit = 50;
		}

		var gr = new GlideRecord('sn_cmdb_ws_reconcile_duplicate_template_suggested_task');
		gr.addQuery('template', template);
		// state 2 is 'Ready' state
		gr.addQuery('state', 2);
		//if they are searching for a certain task, add the search here
		if (search && search.length > 0) {
			gr.addEncodedQuery('task.numberLIKE' + GlideStringUtil.escapeQueryTermSeparator(search) + '^ORtask.short_descriptionLIKE' + GlideStringUtil.escapeQueryTermSeparator(search), true);
		}
		if (this.showOnlyOpenTasks()) {
			// if they want to only show open tasks, add that query
			gr.addQuery('task.state', 1);
		}
		
		gr.orderByDesc('sys_updated_on');
		gr.setLimit(limit);
		gr.query();

		var items = [];
		while (gr.next()) {
			var item = this._initializeTaskItem();

			item.sysId = gr.getValue('task');
			item.number.label = gr.task.number + "";
			item.short_description = {
				label: gr.task.short_description + ""
			};
			var count = gr.getValue('ci_count');
			item.ci_count.value = count;
			item.ci_count.data = this._getCiCountData(count, item.ci_count.label);

			// the value of discovery source in the suggested task table is a string
			// and the UI needs it to be an array
			var sourceValue = gr.getValue('discovery_source');
			var sourceArr = [];
			if (sourceValue && sourceValue.length !=0 && sourceValue != '') {
				sourceArr = sourceValue.split(',');
			}
			var sources = {
				value: sourceArr
			};
			item.sources.value = sources;

			items.push(item);
		}

		return items;
	},

    type: 'GetDedupeTaskInfo'
};
