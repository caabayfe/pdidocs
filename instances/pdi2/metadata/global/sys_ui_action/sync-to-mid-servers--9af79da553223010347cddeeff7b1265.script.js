function syncToMids() {
	var profileIds = (typeof g_list != 'undefined' && g_list !== null) ? g_list.getChecked() : g_form.getUniqueValue();
	if (!profileIds)
		return;
	
	// get profile numbers for confirmation
	var profileNumbers = [];
	var sysidList = profileIds.split(",");
	var gr = new GlideRecord('mid_server_profile');
	for (var i = 0; i < sysidList.length; i++) {
		if (gr.get(sysidList[i]) && gr.getValue("number"))
			profileNumbers.push(gr.getValue("number"));
		else
			profileNumbers.push(sysidList[i]);
	}
	
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var gdw = new dialogClass("sync_profile_to_mids");
	gdw.setTitle(getMessage("Sync Profile Settings to MID Servers"));
	gdw.setWidth("100%");
	gdw.setPreference("profileIds", profileIds);
	gdw.setPreference("profileNumbers", profileNumbers);
	gdw.setPreference("fromUIAction", true);
	gdw.render();
}
