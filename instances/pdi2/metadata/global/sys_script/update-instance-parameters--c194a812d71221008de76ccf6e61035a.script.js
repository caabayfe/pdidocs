updateParams();
function updateParams(){
	var definitionId = current.connector_definition;
	var instanceId = current.sys_id;
	var value = new GlideRecord('em_connector_instance_value');
	var params = new GlideRecord('em_connector_parameters');
	gs.log(current.sys_id);
	
	if(current.operation() == 'delete'){
		purgeValue(instanceId);
	}
	
	if(current.operation() == 'insert'){
		insertValue(instanceId, definitionId);
	}
	
	if(current.operation() == 'update'){
		purgeValue(instanceId);
		insertValue(instanceId, definitionId);
	}
	
	function purgeValue(instanceId){
		value.initialize()
		value.addQuery('connector_instance',instanceId);
		value.query();
		value.deleteMultiple();
	}
	
	function insertValue(instanceId, definitionId){
		params.initialize();
		params.addQuery('connector_definition',definitionId);
		params.query();
		while (params.next()){
			value.initialize();
			value.connector_instance = instanceId;
			value.name = params.name;
			value.value = params.value;
			value.insert();
		}
	}
}
