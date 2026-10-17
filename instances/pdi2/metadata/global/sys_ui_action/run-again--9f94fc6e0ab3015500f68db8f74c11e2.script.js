if (current.topic == 'Shazzam') {
	gs.addInfoMessage(gs.getMessage('Rerunning Shazzam Not Available'));
	action.setRedirectURL('discovery_status.do?sys_id=' + current.agent_correlator);
} else {
	var source_sys_id = current.sys_id.toString();
	current.state = 'ready';
	current.processed = '';
	current.created = '';
	current.sequence = '';
	var target_sys_id = current.insert();

	//Copy the attachments over if there's any...
	var sa = new GlideSysAttachment();
	sa.copy('ecc_queue', source_sys_id, 'ecc_queue', target_sys_id);

	var statusGr = new GlideRecord('discovery_status');
	statusGr.get('sys_id', current.agent_correlator + '');
	statusGr.state = 'Active';
	statusGr.update();
}
