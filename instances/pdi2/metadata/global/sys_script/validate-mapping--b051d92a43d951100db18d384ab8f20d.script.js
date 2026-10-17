(function executeRule(current, previous /*null when async*/) {	
	var tableName = current.getValue("source");
	var fieldName = current.getValue("field");
	
	if(!GlideTableDescriptor.get(tableName).isValidField(fieldName)){
		gs.addErrorMessage(gs.getMessage("The following field: {0} is not valid on this table: {1}", GlideStringUtil.escapeHTML(fieldName), GlideStringUtil.escapeHTML(tableName)));
		current.setAbortAction(true);
	}
	
	

})(current, previous);
