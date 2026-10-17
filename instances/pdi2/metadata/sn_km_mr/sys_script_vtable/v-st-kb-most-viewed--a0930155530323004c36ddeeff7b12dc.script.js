(function executeQuery(v_table, v_query) {
	var fieldList = "number,author,sys_view_count,rating,sys_updated_on".split(",");
	var kbService = new global.KBPortalServiceImpl();
	var kb = kbService.getMostViewedArticles('20', 'short_description', fieldList, '');
	if(kb) {
		kb.forEach(function(data) {
			var record = {};
			record.sys_id = data.id;
			record.short_description = data.display_field;
			data.secondary_fields.forEach(function(field) {
				var name = field.name;
				if(name == 'sys_view_count')
					name = 'view_count';
				if(name == 'sys_updated_on')
					name = 'last_updated';
				record[name] = field.value;
			});
			v_table.addRow(record);
		});
	}
})(v_table, v_query);
