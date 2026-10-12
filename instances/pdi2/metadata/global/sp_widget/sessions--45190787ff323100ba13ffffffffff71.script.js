(function() {
	data.allowSessions = false;
	var rec = $sp.getRecord();	 
	if (!rec || !rec.canRead())
		return;

	data.allowSessions = true;
	data.msgs = {};
	data.msgs.typing = gs.getMessage("typing");
	data.msgs.viewing = gs.getMessage("viewing");
	var journalFields = [];	
	var elements = rec.getElements();

	// global and scoped GlideRecord.getElements return two different things,
	// so if we got an ArrayList, convert to Array before doing the work
	if (typeof elements.size != "undefined") {
		var elementArr = [];
		for (var i = 0; i < elements.size(); i++)
			elementArr.push(elements.get(i));
		elements = elementArr;
	}

	// now check canRead on the Journal fields
	for (var j = 0; elements.length > j; j++) {
		var element = elements[j];
		// check the internal type because ED.isJournal() isn't available to scopes
		var fieldType = element.getED().getInternalType();
		if (fieldType != "journal" && fieldType != "journal_input")
			continue;

		var fieldName = element.getName();
		var canRead = element.canRead();
		journalFields.push({field_name: fieldName, can_read: canRead});
	}

	data.journalFields = journalFields;
})();
