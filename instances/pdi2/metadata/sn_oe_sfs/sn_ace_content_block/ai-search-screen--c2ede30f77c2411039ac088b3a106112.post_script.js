(function(context){
	
	var statusColor = '',
		statusLabel = '',
		statusValue = '',
		statusIcon = '';
	
	var isInitialized = false;
	
	var screenTitle = gs.getMessage('Automate');
	var screenSubtitle = gs.getMessage('Request AI Search');
	var screenDescription = gs.getMessage('Add AI-powered search to your bot so users can easily find answers to their questions in your knowledge and catalog content.');
	
	var ciUtil = new sn_oe_sfs.CIUtil();
	if(ciUtil.isAiSearchInitialized()) {
		// AI search is running
		isInitialized = true;
		
		screenSubtitle = gs.getMessage('Set up AI Search');
		screenDescription = gs.getMessage("Define your bot's search experience so users can easily find answers to their questions in your knowledge and catalog content.");
		statusLabel = gs.getMessage('Status');
		statusValue = gs.getMessage('On');
		statusColor = 'positive';
		statusIcon = 'check-outline';

	} else if(ciUtil.isAiSearchServiceConfigured() || ciUtil.isAiSearchEnabled()) {
		// AI search is enabled
		statusLabel = gs.getMessage('Status');
		statusValue = gs.getMessage('Pending');
		statusColor = 'blue';
		statusIcon = 'clock-outline';
	}
	
	context.title = screenTitle;
	context.subtitle = screenSubtitle;
	context.props_details.description = screenDescription;
	context.props_details.image = '/images/ci_landingexp_ais.png';
	context.props_details.body_tag = {
		label: statusLabel,
		value: statusValue,
		color: statusColor,
		icon: statusIcon,
		variant: 'secondary'
	};
	
	if(!isInitialized) {
		context.__is_complete = false;
	}
})(context);
