updateColorValue('sys_highlighted_value_condition', 'color', 'variant');
function updateColorValue(table, colorColumn, variantColumn) {
	if (!pm.isZboot()) {
		var gr = new GlideRecord(table);
		gr.query();
		while (gr.next()){
			var status = gr.getValue('status');
			if (status) {
				gr.setValue(colorColumn, '');
				gr.setValue(variantColumn, '');
				gr.update();
			}
		}
	}
}
