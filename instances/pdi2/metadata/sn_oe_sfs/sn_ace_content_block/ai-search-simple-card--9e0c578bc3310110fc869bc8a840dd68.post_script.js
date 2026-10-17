(function(context){
	var statusLabel, statusColor, statusIcon;

    var ciUtil = new sn_oe_sfs.CIUtil();
	if(ciUtil.isAiSearchInitialized()) {
		// ai search is running
		statusLabel = gs.getMessage('On');
		statusColor = 'positive';
		statusIcon = 'check-outline';

	} else if(ciUtil.isAiSearchServiceConfigured() || ciUtil.isAiSearchEnabled()) {
		// ai search is enabled
		statusLabel = gs.getMessage('Pending');
		statusColor = 'blue';
		statusIcon = 'presence-busy-outline';
	} else {
		// ai search is not enabled
		statusLabel = gs.getMessage('Off');
		statusColor = 'gray';
		statusIcon = 'ban-outline';
	}

	context.props_details.footer_highlight = {
		label: statusLabel,
		color: statusColor,
		icon: statusIcon,
		variant: 'secondary'
	};
	context.props_details.bare=false;

})(context);
