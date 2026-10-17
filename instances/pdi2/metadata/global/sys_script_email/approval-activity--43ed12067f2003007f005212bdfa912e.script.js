(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    var limit = 20;
	var approvers = new GlideRecord('sysapproval_approver');
	approvers.addNotNullQuery('approver');
	approvers.addQuery('approver', '!=', current.approver);
	if (!gs.nil(current.sysapproval))
		approvers.addQuery('sysapproval', current.sysapproval);
	else
		approvers.addQuery('document_id', String(current.document_id));
	approvers.addQuery('state', 'IN', 'approved,rejected,requested');
	approvers.orderBy('approver');
	approvers.setLimit(limit);
	approvers.query();

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
