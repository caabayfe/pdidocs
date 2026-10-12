(function executeRule(current, previous /*null when async*/) {
		var util = new sn_ex_sp.SendToSelfConfigurationUtil();
		var sys_id = !current.isNewRecord() ? current.sys_id : undefined;
		if(current.active && util.checkIfDuplicateConfigRecord(current.portal, current.sys_domain, sys_id)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Only one active configuration record can be present for a portal."));
		}

	})(current, previous);
