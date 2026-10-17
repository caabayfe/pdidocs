(function executeRule(current, previous /*undefined when async or display*/) {
	//Find all sys_portal_preferences that point to this widget
	var gr = new GlideRecord('sys_portal_preferences');
	gr.addQuery('name','sys_id');
	gr.addQuery('value',current.getUniqueValue());
	gr.query();
	
	//Delete all the portals
	while (gr.next()){
		var portal = new GlideRecord('sys_portal');
		portal.get(gr.portal_section);
		portal.deleteRecord();
	}
	
})(current, typeof previous != 'undefined' ?  previous : null);
