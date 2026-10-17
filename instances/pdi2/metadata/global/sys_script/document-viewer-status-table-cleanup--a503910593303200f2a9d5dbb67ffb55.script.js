(function executeRule(current, previous /*null when async*/) {

	var grStatus = new GlideRecord('sys_document_viewer_status');
	grStatus.addQuery('attachment_id',current.sys_id);
	grStatus.query();
	
	if(grStatus.next()){
		grStatus.deleteRecord();
	}
	
	var grAudit = new GlideRecord('sys_document_viewer_audit_trail');
	grAudit.addQuery('attachment_id',current.sys_id);
	grAudit.query();
	
	while(grAudit.next()){
		grAudit.deleteRecord();
	}

})(current, previous);
