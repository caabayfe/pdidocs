(function executeRule(current, previous /*null when async*/) {
	var bizCalID = current.getValue('sys_id');
	var ga = new GlideAggregate('sys_trigger');
	ga.addQuery('business_calendar', bizCalID);
	ga.addAggregate('count', 'business_calendar');
	ga.query();
		
	if (ga.next()) {
		if (ga.getAggregate('count', 'business_calendar') > 0) {
			g_scratchpad.need_warning = true;
			return;
		}
	}
	
	g_scratchpad.need_warning = false;
	
})(current, previous);
