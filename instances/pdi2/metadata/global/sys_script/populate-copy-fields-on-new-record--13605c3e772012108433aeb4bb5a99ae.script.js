(function executeRule(current, previous /*null when async*/) {
	var chgUtils = new global.ChangeUtils();

	var gr = new GlideRecordSecure(chgUtils.CHANGE_REQUEST);
	if (gr.get(current.copied_from)) {
		var attributesList = chgUtils._getCsvPropertyValue(chgUtils.PROP_CHANGE_ATTRS, chgUtils.CHANGE_REQUEST_DEFAULT_ATTR_VALUE);
		for (var i = 0; i < attributesList.length; ++i) {
			var name = attributesList[i];
			if (gr.isValidField(name) && gr.getValue(name))
				current.setValue(name, gr.getValue(name));
		}
	}	
})(current, previous);
