function onLoad() {
	var fields = ["applies_sc_task", "applies_req_item", "applies_target_record"];
	var fieldVisible = false;
	for (var i=0; i < fields.length; i++) {
		if (isFieldVisible(fields[i])) {
			var catItem = g_form.getValue('catalog_item');
			if (catItem) {
				var gr = new GlideRecord('sc_cat_item_producer');
				if(gr.get(catItem)) {
					g_form.setDisplay('applies_sc_task', false);
					g_form.setDisplay('applies_req_item', false);
				} else
					g_form.setDisplay('applies_target_record', false);
			}
			break;
		}
	}
	function isFieldVisible(fieldName) {
		var control = g_form.getControl(fieldName);
		if (control && g_tabs2Sections.findTabIndex(fieldName) > -1)
			return true;
		else
			return false;
	}
}
