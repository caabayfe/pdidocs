var gr = new GlideRecord('scan_mute_rule');
	gr.get(current.scan_mute_rule);
	gr.deleteRecord();

	if (RP.isRelatedList())	
		action.setRedirectURL("scan_result.do?sys_id=" + current.result);
	else
		action.setRedirectURL(current);

	gs.addInfoMessage(gs.getMessage('You have unmuted the selected finding(s) for future scans.'), 'unmuteFindings');
