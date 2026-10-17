var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_unreferenced_record_rule');
gr.addQuery('element', 'clean_peripheral');
gr.query();
var updatedLabel = "Clean journals";
if (gr.next()) {
    gr.setValue('column_label', updatedLabel);
	gr.update();
}

var gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_unreferenced_record_rule');
gr.addQuery('element', 'clean_peripheral');
gr.query();
var updatedHint = "Delete journal logs related to the deleted records";
var updatedPlural = "Clean journals";
if (gr.next()) {
    gr.setValue('hint', updatedHint);
	gr.setValue('plural', updatedPlural);
	gr.update();
}
