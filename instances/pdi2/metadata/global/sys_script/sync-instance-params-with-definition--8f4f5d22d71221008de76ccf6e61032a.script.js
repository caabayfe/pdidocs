updateParams();
function updateParams(){
	var operation = current.operation();
	var definitionId = current.connector_definition;
	var name = current.name;
	var value = new GlideRecord('em_connector_instance_value');
	var instance = new GlideRecord('em_connector_instance');
	
	if(!checkActiveInstance())
		return;
	
	if(operation == 'insert'){
		instance.addQuery('connector_definition',definitionId);
		instance.query();
		while (instance.next()){
			var instanceId = instance.sys_id;
			value.initialize();
			value.connector_instance = instanceId;
			value.name = name;
			value.insert();
		}
	}
	
	if(operation == 'update'){
		if(definitionId != previous.connector_definition){
			gs.addErrorMessage(gs.getMessage('You cannot change the connector definition'));
			current.setAbortAction(true);
			return;
		}
		instance.addQuery('connector_definition',definitionId);
		instance.query();
		while (instance.next()){
			var instanceId = instance.sys_id;
			value.initialize();
			value.addQuery('connector_instance',instanceId);
			value.addQuery('name', previous.name);
			value.query();
			value.next();
			value.name = name;
			value.update();
		}
	}
	
	if(operation == 'delete'){
		instance.addQuery('connector_definition',definitionId);
		instance.query();
		while (instance.next()){
			var instanceId = instance.sys_id;
			value.initialize();
			value.addQuery('connector_instance',instanceId);
			value.addQuery('name', name);
			value.query();
			value.deleteMultiple();
		}
	}
	
	function checkActiveInstance(){
		instance.addQuery('connector_definition',definitionId);
		instance.addQuery('active',true);
		instance.query();
		if(instance.hasNext()){
			gs.addErrorMessage(gs.getMessage('You cannot change parameters for this definition. This definition is associated with active instance.'));
			current.setAbortAction(true);
			return false;
		}
		instance.initialize();
		return true;
	}
}
