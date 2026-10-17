updateClientActions();

function updateClientActions() {
	var gr = new GlideRecord('sys_declarative_action_assignment');
	gr.addQuery('action.action_type', '=' ,'dispatch_action');
	gr.addQuery('client_action', '=', '');
	gr.query();

	while (gr.next()) {
		var actionDefSysId = gr.getValue('action');
		var clientAction = getPayloadDefSysId(actionDefSysId);

		gr.setValue('client_action', clientAction);
		gr.setValue('declarative_action_type', 'dispatch_action');
		gr.update();
	}
}

function getPayloadDefSysId(actionDefSysId) {
	var actionDef = new GlideRecord('sys_declarative_action_definition');   
	if (!actionDef.get(actionDefSysId))
		return '';

	var dispatchKey = actionDef.getValue('dispatch_action');
	var payloadDef = new GlideRecord('sys_declarative_action_payload_definition');
	payloadDef.addQuery('action_key', dispatchKey);
	payloadDef.query();
	
	if (payloadDef.next())
		return payloadDef.getUniqueValue();
	
	return '';
}
