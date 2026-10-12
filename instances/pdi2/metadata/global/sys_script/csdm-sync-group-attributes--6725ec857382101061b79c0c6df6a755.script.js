(function executeRule(current, previous /*null when async*/ ) {

	var prevValues = {};
	var updateWithValues = {};
	
    if (current.support_group.changes()) {
		updateWithValues.support_group = current.getValue('support_group');
		prevValues.support_group = previous.getValue('support_group');
	}
	if (current.assignment_group.changes()) {
		updateWithValues.assignment_group = current.getValue('assignment_group');
		prevValues.assignment_group = previous.getValue('assignment_group');
	}
	if (current.managed_by_group.changes()) {
		updateWithValues.managed_by_group = current.getValue('managed_by_group');
		prevValues.managed_by_group = previous.getValue('managed_by_group');
	}
	
	if(JSUtil.nil(updateWithValues) || Object.keys(updateWithValues).length == 0)
		return;
	
    gs.eventQueue('csdm.tso.modified', current, JSON.stringify(prevValues),  JSON.stringify(updateWithValues), 'sn_csdm_tso_queue');
	
	gs.addInfoMessage(gs.getMessage('Data sync is activated for Change Group, Support Group, and Managed By Group fields.') +
									" <a href='/api/now/v1/context_doc_url/enable-datasync' target='_blank'>" +
									gs.getMessage('Learn more') + "</a>");

})(current, previous);
