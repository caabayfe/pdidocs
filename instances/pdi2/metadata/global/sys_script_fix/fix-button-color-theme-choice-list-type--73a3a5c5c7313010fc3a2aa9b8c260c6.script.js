var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_sg_button_instance');
gr.addQuery('element', 'color_theme');
gr.query();
if (gr.next()) {
    gr.choice = '1';
	gr.default_value = "";
    gr.update();
}
