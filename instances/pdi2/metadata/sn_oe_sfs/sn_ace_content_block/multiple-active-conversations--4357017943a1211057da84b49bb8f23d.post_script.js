(function(context){
	var statusLabel, statusColor, statusIcon;

    var isEnabled = new sn_oe_sfs.CIUtil().isMultipleActiveConversationsEnabled();
	if(isEnabled) {
		statusLabel = gs.getMessage('On');
		statusColor = 'positive';
		statusIcon = 'check-outline';
	} else {
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

	context.props_details.footer_text = gs.getMessage("Default consumer account context: {0}", new sn_oe_sfs.CIUtil().getDefaultConsumerAccountContext());
	context.props_details.bare=false;
})(context);
