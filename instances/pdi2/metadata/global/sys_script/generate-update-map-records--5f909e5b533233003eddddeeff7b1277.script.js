(function executeRule(current, previous /*null when async*/) {

	var applicableTo = current.getValue('applicable_to');
	var displayApplicableTo = current.getDisplayValue('applicable_to');

	var modelIds = applicableTo.split(',');
	var modelDisplayNames = displayApplicableTo.split(',');

	var template = generateTemplate();
	
  // iterate over each applicable to and generate a map record for it
	modelIds.map(function(model, index) {
		generateMapRecord(model, modelDisplayNames[index]);
	});
	
  // delete any map records that were removed from applicable_to
	deleteOrphanMapRecords(modelIds);
	
  // create map record and prepopulate fields
	function generateMapRecord(model, modelName) {
		var map = new GlideRecord('sys_declarative_action_payload_mapping');
		map.addQuery('model', model);
		map.addQuery('action_payload_definition', current.getUniqueValue());
		map.query();

		if (map.next())  {
			map.setValue('payload_map', template);
			map.update();
			return;
		}

		map.initialize();
		map.setValue('model', model);
		map.setValue('action_payload_definition', current.getUniqueValue());
		map.setValue('label', current.getValue('label') + ' ' + modelName);
		map.setValue('payload_map', template);
		map.insert();
	}
	
  // generate template queryString to set to the mapping record using
  // payload variables
	function generateTemplate() {
		var payloadDefinitionId = current.getUniqueValue();
		var variables = new GlideRecord('sys_declarative_action_payload_field');
		variables.addQuery('model', payloadDefinitionId);
		variables.query();
		
		var template = "";
		while(variables.next()) {
			var name = variables.getValue('element');
			var defaultValue = variables.getValue('default_value');
			template += (name + "=" + (defaultValue ? defaultValue : "") + "^");
		}
		template += "EQ";
		return template;
	}
	
  // delete map records not included in modelIds
	function deleteOrphanMapRecords(modelIds) {
		var map = new GlideRecord('sys_declarative_action_payload_mapping');
		map.addQuery('action_payload_definition', current.getUniqueValue());
		modelIds.map(function(modelId) {
			map.addQuery('model', '!=', modelId);
		});
		map.deleteMultiple();
	}
})(current, previous);
