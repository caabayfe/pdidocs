(function executeRule(current, previous /*null when async*/) {

	var className = current.sys_class_name;
	var existingContentGr = new GlideRecord(className);
	existingContentGr.addQuery('sys_class_name', className);
	existingContentGr.addQuery('notification', current.notification);
	existingContentGr.addActiveQuery();
	if(current.operation() == 'update') {
		existingContentGr.addQuery('sys_id', '!=', current.sys_id);
	}
	existingContentGr.query();
	
	if(existingContentGr.hasNext()) {
		if(className == 'sys_notification_va_content_messaging')
			gs.addErrorMessage(gs.getMessage('An active provider content for Virtual Agent Content - Messaging notification type already exists. Only one active provider content can be created for each content type.'));
		else 
			gs.addErrorMessage(gs.getMessage('An active provider content for Virtual Agent Content - Chat notification type already exists. Only one active provider content can be created for each content type.'));
		current.setAbortAction(true);
	}

})(current, previous);
