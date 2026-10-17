(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var approvers = new GlideRecord('sysapproval_approver');
	approvers.addNotNullQuery('approver');
	approvers.addQuery('approver', '!=', current.approver);
	if (!gs.nil(current.getValue("sysapproval"))) {
		approvers.addQuery('sysapproval', current.sysapproval);
	}
	approvers.addQuery('document_id', current.document_id);	
	approvers.addQuery('state', 'IN', 'approved,rejected,requested');
	approvers.orderBy('approver');
	approvers.query();
	var limit = 20; 
	approvers.setLimit(limit);
	if (approvers.getRowCount() > 0) {
		while (approvers.next()) {
			template.print(approvers.approver.getDisplayValue() + ' - ' + approvers.state.getDisplayValue() + '<br/>');
		}
		if (approvers.getRowCount() > limit) {
			template.print('Additional approvers are available and require viewing the record.<br/>');
		}
	} else {
		template.print('You are the sole approver.<br/>');
	}

})(current, template, email, email_action, event);
