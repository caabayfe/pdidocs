
			var fields = [{'name': 'sys_sg_master_item', 'element': 'screen'},
	{'name': 'sys_sg_related_list_map', 'element': 'destination_screen'},
	{'name': 'sys_sg_ui_parameter', 'element': 'screen'},
	{'name': 'sys_sg_screen_param_map', 'element': 'screen'}];
	for (var i = 0; i < fields.length; i++) {
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('name', fields[i].name);
		gr.addQuery('element', fields[i].element);
		gr.query();
		if (gr.next()) {
			gr.setValue('reference_cascade_rule', 'clear');
			gr.update();
		}
	}
