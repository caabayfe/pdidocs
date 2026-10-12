//If a ts_language attribute is added via the attributes field, verifies that this attribute does not already exist for the updated field's table. 
(function executeRule(current, previous /*null when async*/) {
	var td = GlideTableDescriptor.get(current.name);
	var elements = td.getSchemaList();
	for (var i = 0; i < elements.size(); i++) {
		var ed = elements.get(i);
		if (ed.getAttribute('ts_language') != null) {
			gs.addErrorMessage("Could not add ts_language attribute to this field. This attribute already exists for Table: " + current.name + " on Field: " + ed.getColumnName());
		current.attributes = previous.attributes;
			current.setAbortAction(true);
			return;
			}
	}

		gs.addInfoMessage("ts_language attribute added successfully. Table: " + current.name + " will need to be reindexed.");

})(current, previous);
