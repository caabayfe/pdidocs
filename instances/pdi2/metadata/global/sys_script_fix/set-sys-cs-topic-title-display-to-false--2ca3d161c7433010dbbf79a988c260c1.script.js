(function() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addEncodedQuery('name=sys_cs_topic^element=name^ORelement=title');
	gr.orderBy('element');
	gr.query();
	gr.next();
	//check the display property of 'name' column
	var nameDisplay = gr.getDisplayValue('display');
	//set the display property of 'title' column
	if (gr.next()) {
         if (nameDisplay === 'true') {
             gr.setValue('display', 'false');
             gr.update();
         }
	}
})();
