function transform() {
	var result = {
		'itsm_active': false,
		'hr_active': false,
		'hr_all_active': false,
		'notifications_enabled': false,
		'ais_enabled': false,
		'va_enabled': false
	};

	// plugin enabled check
	var plugins = [
		'com.glide.cs.chatbot',
		'sn_itsm_va',
		'sn_iar_hr',
		'com.snc.notify.twilio_direct',
		'com.sn.va.teams',
		'com.sn.va.slack'
	];
	plugins.forEach(function(plugin) {
		result[plugin.replaceAll('.', '_')] = GlidePluginManager.isActive(plugin);
	});

	// check itsm iar active
	var gr = new GlideRecord('sys_cs_auto_resolution_configuration');
	gr.addActiveQuery();
	gr.addQuery('target_table_name', 'incident');
	gr.query();
	while (gr.next()) {
		result.itsm_active = true;
	}

	// check hr iar active
	var hr_inactive = false;
	gr = new GlideRecord('sys_cs_auto_resolution_configuration');
	gr.addQuery('target_table_name', 'CONTAINS', 'sn_hr');
	gr.query();
	while (gr.next()) {
		if (gr.getValue('active') == true) result.hr_active = true;
		if (gr.getValue('active') == false) hr_inactive = true;
	}
	if (result.hr_active && !hr_inactive) result.hr_all_active = true;
	
	// notifications enabled check
	gr = new GlideRecord('sys_cs_channel');
	gr.get('ea0cb816732110104a905ee515f6a7b5'); // mweb channel
	result.notifications_enabled = gr.getValue('enable_notification') == "1" ? true : false;

	// va on portal check
	gr = new GlideRecord('sp_agent_chat_config');
	gr.addActiveQuery();
	gr.query();
	if (gr.next()) {
		result.va_enabled = true;
	}

	// ai search check
	result.ais_enabled = new sn_ais.StatusApi().isAisEnabled();

	return result;
}
