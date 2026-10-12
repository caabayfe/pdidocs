var fieldsToClear = [
	'hide_panel_footer',
	'hide_panel_restore',
	'hide_panel_advanced',
	'hide_panel_condition_delete'
];

function onCondition() {
	fieldsToClear.forEach(function (fieldName) {
		g_form.clearValue(fieldName);
		g_form.setReadOnly(fieldName, true);
	});
}
