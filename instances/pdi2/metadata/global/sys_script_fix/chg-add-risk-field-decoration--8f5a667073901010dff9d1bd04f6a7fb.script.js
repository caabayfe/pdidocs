(function() {
	if (pm.isZboot())
		return;

	var table = "change_request";
	var column = "risk";
	var newAttrib = "change_risk_details";

	var dictGr = new GlideRecord("sys_dictionary");
	dictGr.addQuery("name", table);
	dictGr.addQuery("element", column);
	dictGr.query();
	if (dictGr.next()) {
		var attributes = new GlideAttributes(dictGr.getValue("attributes"));
		var origFieldDecorations = attributes.getAttribute("field_decorations");
		var newFieldDecorations = origFieldDecorations;
		
		if (!newFieldDecorations)
			newFieldDecorations = newAttrib;
		else if (newFieldDecorations.indexOf(newAttrib) === -1)
			newFieldDecorations += ";" + newAttrib;

		if (newFieldDecorations !== origFieldDecorations)
			SNC.DictionaryAttribute.set(table, column, "field_decorations", newFieldDecorations);
	}
})();
