function onAfter(current, previous) {
	
	var sys_id = current.sys_id;
	var newTitle = current.name;
	var oldTitle = previous.name;
	
	var portalPref = new GlideRecord('sys_portal_preferences');
	portalPref.addQuery('name','sys_id');
	portalPref.addQuery('value',sys_id);
	portalPref.query();
	
	while(portalPref.next()) {
		var titlePref = new GlideRecord('sys_portal_preferences');
		titlePref.addQuery('portal_section',portalPref.getValue('portal_section'));
		titlePref.addQuery('name', 'title');
		titlePref.query();
		
		if(titlePref.next()) {
			titlePref.value = newTitle;
			titlePref.update();
		}
	}
}
