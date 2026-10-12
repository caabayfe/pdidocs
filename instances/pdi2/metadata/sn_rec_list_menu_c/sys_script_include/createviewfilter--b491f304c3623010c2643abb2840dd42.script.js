var createViewFilter = function(tableName) {
		var gr = new GlideRecord('sys_ui_list');
		gr.addQuery('name=' + tableName);
		gr.query();

		var queries = {};
		while(gr.next()) {
			var sysId = gr.view.sys_id + '';
			if(queries[sysId]) continue;
			queries[sysId] = '';
		}

		var res = 'sys_idIN' + Object.keys(queries).join(',');
		return res;
};
