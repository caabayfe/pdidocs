(function executeRule(current, previous /*null when async*/) {
	var element = current.getValue('element');
	var value = current.getValue('default_value');
	var configurable = current.getValue('configurable');
	updateMapRecords(element, value, configurable);
	
  // Remove field query string (field) from every mapping
	function updateMapRecords(element, value, configurable) {
		var mapping = new GlideRecord('sys_declarative_action_payload_mapping');
		mapping.addQuery('action_payload_definition', current.getValue('model'));
		mapping.query();

		while (mapping.next()) {
				appendQueryString(element, value, mapping);
		}
	}
	
  // iterate over the query string and remove the substring
  // that contains the removed field
	function removeQueryString(element, mapping) {
		var query = mapping.getValue('payload_map');
		var queryString = new GlideQueryString(query);
		queryString.deserialize();
		var terms = queryString.getTerms();
		var updatedMap = '';
		for (var i = 0; i < terms.size(); i++) {
			var queryPart = terms.get(i);
			var term = queryPart.getTermField();
			var operator = queryPart.getOperator();
			var value = queryPart.getValue();
			if (String(term) !== String(element) && term) {
				updatedMap += term + operator + value + "^";
			}
		}
		
		updatedMap += 'EQ';
		mapping.setValue('payload_map', updatedMap);
		mapping.update();
	}
	
  // append element to the query string
	function appendQueryString(element, value, mapping) {
		var query = mapping.getValue('payload_map');
		var newQuery = element + '=' + value + "^";
		query = newQuery + query;
		mapping.setValue('payload_map', query);
		mapping.update();
	}
})(current, previous);
