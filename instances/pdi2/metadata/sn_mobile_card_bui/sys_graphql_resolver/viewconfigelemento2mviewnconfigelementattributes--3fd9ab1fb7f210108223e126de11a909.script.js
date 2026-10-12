(function process(env) {
	var viewConfigElementId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecordSecure('sys_sg_view_config_element_attribute');
	gr.query('view_config_element', viewConfigElementId);

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
		"viewConfigElement": gr.getValue("view_config_element"),
		"name": gr.getDisplayValue("name"),
		"description": gr.getValue("description"),
		"value": gr.getValue("value"),
		"translatedValue": gr.getValue("translated_value"),
		"icon": icon
		});
	}

	return response;

})(env);
