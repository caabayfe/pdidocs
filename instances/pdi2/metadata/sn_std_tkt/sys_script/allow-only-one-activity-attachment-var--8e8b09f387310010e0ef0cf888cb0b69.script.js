(function executeRule(current, previous /*null when async*/) {

	if(current.type != 'custom') {
		var gr = new GlideRecord('ticket_tab_configuration');
		gr.addQuery('parent', current.parent);
		gr.addQuery('type', current.type);
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage('Tab for {0} has already been added', current.getDisplayValue('type')));
			current.setAbortAction(true);
			return;
		}

		if (current.type == 'variable_editor') {
			var gr = new GlideRecord('ticket_tab_configuration');
			gr.addQuery('parent', current.parent);
			gr.addQuery('type', 'variable_summary');
			gr.query();
			if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
				gs.addErrorMessage(gs.getMessage('This configuration already has a tab with variables'));
				current.setAbortAction(true);
			}
		}
		else if (current.type == 'variable_summary') {
			var gr = new GlideRecord('ticket_tab_configuration');
			gr.addQuery('parent', current.parent);
			gr.addQuery('type', 'variable_editor');
			gr.query();
			if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
				gs.addErrorMessage(gs.getMessage('This configuration already has a tab with variables'));
				current.setAbortAction(true);
			}
		}
	}

})(current, previous);
