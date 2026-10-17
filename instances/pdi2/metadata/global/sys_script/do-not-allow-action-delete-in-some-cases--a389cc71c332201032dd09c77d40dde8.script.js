(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_notification_actionable_content');
	gr.addQuery('notification', current.notification);
	gr.addQuery('actions', 'CONTAINS', current.sys_id);
	gr.setLimit(1);
	gr.query();
	if(gr.next()) {
		gs.addErrorMessage(gs.getMessage("The selected Action(s) cannot be deleted because at-least one of the selected Action(s) is added as part of the content via \"Link Actions to Content\""));
		current.setAbortAction(true);
	}

})(current, previous);
