doInsertAndStay();
function doInsertAndStay() {
	var saveMe = current;
	var onMetadataForm = current.getTableName() == "sys_metadata";
	if(onMetadataForm) {
		// get actual record and copy over the changed sys_metadata values
		var gr = new GlideRecord(current.sys_class_name.toString());
		gr.get(current.sys_id.toString());
		var elements = current.getElements();
		var numElements = elements.size();
		for(var i = 0; i < numElements; i++) {
			var element = elements.get(i);
			if(element.changes())
				gr.setValue(element.getName().toString(), current.getValue(element.getName().toString()));
		}
		current = gr;
	}

	current.sys_scope = gs.getCurrentApplicationId();
	current["default"] = false;

  var id = insertRecord(current);
	if(onMetadataForm)
		saveMe = "sys_metadata.do?sysparm_ignore_class=true&sys_id=" + id;
	action.setRedirectURL(saveMe);
}
