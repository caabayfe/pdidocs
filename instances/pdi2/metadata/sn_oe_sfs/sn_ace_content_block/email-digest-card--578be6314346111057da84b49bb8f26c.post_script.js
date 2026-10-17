(function(context){
	var statusLabel, statusColor, statusIcon;

    var isEmailDigestActive = new sn_oe_sfs.CIUtil().isEmailDigestEnabled();
	if(isEmailDigestActive) {
		statusLabel = gs.getMessage('ON').toUpperCase();
		statusColor = 'positive';
		statusIcon = 'check-outline';
	} else {
		statusLabel = gs.getMessage('OFF').toUpperCase();
		statusColor = 'gray';
		statusIcon = 'ban-outline';
	}

	context.props_details.footer_highlight = {
		label: statusLabel,
		color: statusColor,
		icon: statusIcon,
		variant: 'secondary'
	};

})(context);
