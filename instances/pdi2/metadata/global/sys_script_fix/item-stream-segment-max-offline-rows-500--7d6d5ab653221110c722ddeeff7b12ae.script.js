var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_sg_item_stream_segment');
gr.addQuery('element', 'max_offline_rows');
gr.query();
if (gr.next()) {
	gr.setValue('default_value', '500');
	gr.update();
}
