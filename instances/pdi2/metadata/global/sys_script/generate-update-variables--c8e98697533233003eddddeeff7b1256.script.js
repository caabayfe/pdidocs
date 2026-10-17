(function executeRule(current, previous /*null when async*/) {
	var rawPayload = current.getValue("payload_template");
	var payload = JSON.parse(rawPayload);
	var generatedPayloadKeys = generateVariables(payload, '');
	var flattenedKeys = flatten(generatedPayloadKeys);
	var deletedKeys = deleteVariables(flattenedKeys);
	updateMapRecord(deletedKeys, flattenedKeys);

	// generate variable record and prepopulate fields
	function generateVariable(fieldLabel, pathPrefix, defaultValue) {
		var variable = new GlideRecord('sys_declarative_action_payload_field');

		variable.addQuery('element', pathPrefix);
		variable.addQuery('model', current.getUniqueValue());
		variable.query();

		// check if variable record already exists
		// just update default value		
		if (variable.next()) {
			variable.setValue('default_value', defaultValue);
			variable.update();
			return variable.getValue('configurable') == true;
		}
		
		variable.initialize();
		variable.setValue('label', fieldLabel);
		variable.setValue('element', pathPrefix);
		variable.setValue('internal_type', 'string');
		variable.setValue('default_value', defaultValue);
		variable.setValue('model', current.getUniqueValue());
		variable.setValue('max_length', 100);
		variable.setValue('configurable', true);
		variable.insert();
		return false;
	}
	
	// iterate over payload template and create variable records for non-objects
	// nested objects are separated by @ character
	// client code interprets this to assign values to object
	function generateVariables(payload, pathPrefix) {
		var payloadKeys = Object.keys(payload).map(function(key) {
			var newPath = (pathPrefix) ? pathPrefix + '@' + key : key;
			if (payload[key] instanceof Object) {
				return generateVariables(payload[key], newPath);
			}
			
			var configurable = generateVariable(key, newPath, payload[key]);
			return { label: key, value: payload[key], element: newPath, configurable: configurable };
		});
		return payloadKeys;
	}
	
	// Delete lingering variable records that are no longer needed
	function deleteVariables(payloadKeysList) {
		var variable = new GlideRecord('sys_declarative_action_payload_field');
		variable.addQuery('model', current.getUniqueValue());
		payloadKeysList.map(function(keyObj) {
			variable.addQuery('element', '!=', keyObj.element);
		});

		variable.query();
		var deletedKeys = [];
		while (variable.next()) {
			deletedKeys.push(variable.getValue('element'));
			variable.deleteRecord();
		}

		return deletedKeys;
	}

	// Update map record's query string using the list of 
	// new variables and deleted variables
	function updateMapRecord(deletedKeys, newKeys) {
		var mapping = new GlideRecord('sys_declarative_action_payload_mapping');
		mapping.addQuery('action_payload_definition', current.getUniqueValue());
		mapping.query();

		while(mapping.next()) {
			var query = mapping.getValue('payload_map');
			var queryString = new GlideQueryString(query);
			queryString.deserialize();
			var terms = queryString.getTerms();
			var updatedMap = '';
			var existingTerms = [];

			// update 
			for (var i = 0; i < terms.size(); i++) {
				var queryPart = terms.get(i);
				var term = queryPart.getTermField();
				var operator = queryPart.getOperator();
				var value = queryPart.getValue();
				if (!includes(deletedKeys, term) && term) {
					updatedMap += term + operator + value + "^";
					existingTerms.push(term);
				}
			}

			// add new keys
			newKeys.map(function(keyObj) {
				if (!includes(existingTerms, keyObj.element) && !keyObj.configurable) {
					updatedMap += keyObj.element + "=" + keyObj.value + "^";
				}
			});
			
			updatedMap += 'EQ';
			mapping.setValue('payload_map', updatedMap);
			mapping.update();
		}
	}
	
	function includes(arr, key) {
		return arr.filter(function(el) {
			return String(el) === String(key);
		}).length > 0;
	}

	// flatten array to be 1-d
	function flatten(arr) {
		return arr.reduce(function(flatList, el) {
			if (Array.isArray(el))
				return flatList.concat(flatten(el));
			return flatList.concat(el);
		}, []);
	}
	
})(current, previous);
