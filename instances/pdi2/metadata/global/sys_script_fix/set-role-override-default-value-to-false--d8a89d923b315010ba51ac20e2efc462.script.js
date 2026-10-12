gs.log("Fix Script: Set role_override default value to false - started");
var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'pa_indicators');
gr.addQuery('element', 'role_override');
gr.addQuery('default_value', true);
gr.query();
if (gr.next()) {
	gr.setValue('default_value', false);
	gr.update();
}
gs.log("Fix Script: Set role_override default value to false - ended");
