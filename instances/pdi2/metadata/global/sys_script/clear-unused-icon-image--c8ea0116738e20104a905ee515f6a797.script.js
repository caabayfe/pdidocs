(function executeRule(current, previous /*null when async*/) {

	current.setValue('icon_image', '');
	var attachment = new GlideSysAttachment();
	var qwaAttach = attachment.getAllAttachments('quickactions_workspace_action', current.sys_id);
	while(qwaAttach.next()) {
		attachment.deleteAttachment(qwaAttach.getValue("sys_id"));
	}

})(current, previous);
