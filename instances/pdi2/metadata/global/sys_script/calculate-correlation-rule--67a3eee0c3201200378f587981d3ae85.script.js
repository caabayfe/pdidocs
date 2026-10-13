(function executeRule(current, previous) {

	//use another field because we can disable correlation but analytics can still be active
	if (gs.getProperty('evt_mgmt.disable_all_correlation_job', 'false') != 'false') {
		return;
	}

	if (!stateChange()) {
		return;
	}

	// GOG alerts must not run correlation now; we'll check for close/reopen in an "after" rule.
	if (current.sn_extra_data) {
		var additionalInfo = JSON.parse(current.additional_info);
		if (additionalInfo.sn_partofGOGgroup) {
			return;
		}
	}

	var alertManager = new SNC.AlertManager();
	if(current.state == 'Open' || current.state == 'Reopen') {
		if(gs.getProperty('evt_mgmt.enable_alert_correlation') == 'true' && !alertManager.isThreadProcessingEvents()){
			alertManager.calculateAlertCorrelation(current);
		}
	}
	else {  //close should allways be activated, to support SA groups
		alertManager.calculateAlertCorrelation(current);
	}

	function stateChange(){
		if (current.state === previous.state) {
			return false;
		}

		// State was updated, will calculate alerts if moved from open/reopen to closed/flapping or back.
		var newState = 'Closed';
		var oldState = 'Closed';
		if (current.state == 'Open' || current.state == 'Reopen')
			newState = 'Open';
		if (previous.state == 'Open' || previous.state == 'Reopen')
			oldState = 'Open';
		return (newState !== oldState);
	}
})(current, previous);
