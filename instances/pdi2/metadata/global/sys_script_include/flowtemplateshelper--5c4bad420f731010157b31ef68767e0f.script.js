var FlowTemplatesHelper = Class.create();
FlowTemplatesHelper.prototype = {
    initialize: function() {
    },
	
	activateConnection: function(connectionId) {
		var gr = new GlideRecord('sys_connection');
		gr.addQuery('sys_id', connectionId);
		gr.query();
		if (gr.next()) {
			if (gr.getValue("active") == 0) {
				var activeGr = new GlideRecord("sys_connection");
				var domain = gr.getValue('sys_domain');
				var alias = gr.getValue('connection_alias');
				activeGr.addQuery('sys_domain', domain);
				activeGr.addQuery('connection_alias', alias);
				activeGr.addQuery('active', true);
				activeGr.query();
				if (activeGr.next()) {
					activeGr.active = false;
					activeGr.update();
				}
				gr.active = true;
				gr.update();
			} 
		}
	},
	
	overrideLabelCache: function(flowid, datapill_field, table, tableLabel) {
		var datapillName = "Updated_1.current." + datapill_field;
		var tableGr = new GlideRecord(table);
		var fieldLabel = tableGr.getElement(datapill_field).getLabel();
		var addon = {};
		addon.name = datapillName;
		addon.label = "Trigger➛" + tableLabel + " Record➛" + fieldLabel;
		addon.reference = "";
		addon.reference_display = fieldLabel;
		addon.type = "string";
		addon.base_type = "string";
		addon.parent_table_name = table;
		addon.column_name = datapill_field;
		var flowGr = new GlideRecord("sys_hub_flow_base");
		flowGr.addQuery('sys_id', flowid);
		flowGr.query();
		if (flowGr.next()) {
			var cache = JSON.parse(flowGr.getValue('label_cache'));
			cache.push(addon);
			var newstr = JSON.stringify(cache);
			flowGr.label_cache = newstr;
			flowGr.update();
		}
	},

    type: 'FlowTemplatesHelper'
};
