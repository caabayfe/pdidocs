(function process(env) {
	var templateSlotId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecordSecure('sys_sg_view_template_slot_attribute');
	gr.query('view_template_slot', templateSlotId);

	var response = [];

	while (gr.next()) {
		var icon = null;
		// We check sys id value here instead of getDisplayValue because Icon could be translated to other languages
		// and we have to check this individual reference sys id (not the getUniqueValue of the record)
		if (gr.getValue("name") === "315f99c2b7321010df65f6efce11a9dc") {
			var iconGR = new GlideRecordSecure("sys_sg_icon");
			if (iconGR.get(gr.getValue("value"))) {
				icon = {
					id: iconGR.getUniqueValue(),
					icon: iconGR.getValue("icon"),
					name: iconGR.getValue("name"),
					type: iconGR.getValue("type")
				};
			}
		}
		response.push({
		"id": gr.getUniqueValue(),
		"templateSlot": gr.getValue("view_template_slot"),
		"name": gr.getValue("name"),
		"description": gr.getValue("description"),
		"value": gr.getValue("value"),
		"translatedValue": gr.getValue("translated_value"),
		"protectionPolicy": gr.getValue("sys_policy"),
		"icon": icon
		});
	}

	return response;
})(env);
