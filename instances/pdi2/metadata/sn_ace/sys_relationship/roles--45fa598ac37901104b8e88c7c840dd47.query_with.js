(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var screen = parent.route.screen_type.toString();
	var gr = new GlideRecord('sys_ux_screen');
	gr.addQuery('screen_type', screen);
	gr.query();
	if(gr.next()){
		current.addQuery('screen', gr.getUniqueValue());
	}

})(current, parent);
