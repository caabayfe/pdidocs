(function executeRule(current, previous /*null when async*/) {
	var isConfProviderAvailable = false;
	var servProviders = new NotifyConferenceUtils().getServiceProviderList();
	for (var i=0; i < servProviders.length; i++) {
		if (servProviders[i] === 'Telephony')
			continue;
		isConfProviderAvailable = true;
		break;
	}
	g_scratchpad.show_conference_provider = isConfProviderAvailable;
})(current, previous);
