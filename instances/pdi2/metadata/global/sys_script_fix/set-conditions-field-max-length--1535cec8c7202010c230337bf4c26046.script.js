var gr = new GlideRecord('sys_dictionary');
gr.addEncodedQuery('name=sys_highlighted_value_condition^element=conditions^max_length!=4000');
gr.query();
if (gr.next()){
	gr.setValue('max_length', 4000);
	gr.update();
}
