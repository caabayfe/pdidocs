(function executeRule(current, previous) {
	var entry = current.whitelist_entry;
	var relatedArray = entry.split(".");

	if(relatedArray.length != 2 || GlideStringUtil.nil(relatedArray[0]) || GlideStringUtil.nil(relatedArray[1])) {
		gs.addInfoMessage(gs.getMessage("Invalid entry, expecting format as: table.column"));
		current.setAbortAction(true);
		return;
	}

	var td = GlideTableDescriptor.get(relatedArray[0]);
	if(!td.isValid()) {
		gs.addInfoMessage(gs.getMessage("Invalid table name: {0}", relatedArray[0]));
		current.setAbortAction(true);
		return;
	}

	var ed = td.getElementDescriptor(relatedArray[1]);
	if(ed == null || (!ed.isReference())) {
    gs.addInfoMessage(gs.getMessage("Invalid reference field: {0} for table {1}", relatedArray[1], relatedArray[0]));
    current.setAbortAction(true);
		return;
	}

})(current, previous);
