function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
	var facet_field = newValue;	
	for (var i=0; i<sysIDs.length; i++) {
		var facet_id = sysIDs[i];
	
		//Call script includes to check if valid Facet Field name
		var ga = new GlideAjax('ValidateFacets');
		ga.addParam('sysparm_name', 'validate_facet_field');
		ga.addParam('sysparm_facet_field', facet_field);
		ga.addParam('sysparm_facet_id', facet_id);
		ga.getXMLAnswer(updateField);

	}
	
	function updateField (answer) {
		callback(answer === "valid");
	}

}
