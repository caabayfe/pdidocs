function onBefore(current, previous) {
	// If the action was aborted by a previous BR, do not proceed.
	if(current.isActionAborted())
		return;
	// In case of update, delete existing rule, create a new one from new data, and refrash connections according to new rule.
	if(current.operation() == "delete" || current.source_ip != previous.source_ip || current.target_ip != previous.target_ip || current.source_port != previous.source_port || current.target_port != previous.target_port || current.rule_type != previous.rule_type || current.rule != previous.rule || current.order != previous.order){
		gs.print('Updating NAT rule relations');
		var man = new SNC.BusinessServiceManager();
		man.updateNatRuleRelations(previous.getValue('sys_id'));
		if(current.operation() != "delete"){			
			previous.deleteRecord();
			var new_sys_id = current.insert();
			// make the newly inserted record current, in order to display the correct record.
			current = current.get(new_sys_id);
			current.setAbortAction(true);
		}
	}
	else{
		gs.print('NAT rule relations not updated. Fields did not change.');
	}
}
