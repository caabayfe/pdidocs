function startDiscovery() {
	var gdw = new GlideDialogWindow('discover_now');
	gdw.setTitle('');
	gdw.setSize(350,80);
	// the following is what we have to do to make this client
	// script work from a list and form, with today's code
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	
	var listView = !(gel('sys_uniqueValue') != null);
	
	gdw.setPreference('schedule_sys_id', sysId);
	gdw.setPreference('sysparm_list_view', listView);
	gdw.render();
}
