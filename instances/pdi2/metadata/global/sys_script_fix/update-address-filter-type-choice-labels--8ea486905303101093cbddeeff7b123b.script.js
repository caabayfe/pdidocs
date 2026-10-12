(function() {
	updateChoiceLabel("Blacklist");
	updateChoiceLabel("Whitelist");

	function updateChoiceLabel(type) {
		// Get all targeted sys_choice entries
		var choiceValues = new GlideRecord("sys_choice");
		if (type == "Blacklist")
			choiceValues.addQuery("value", "Blacklist");
		else
			choiceValues.addQuery("value", "Whitelist");

		choiceValues.addQuery("name", "sys_email_address_filter");
		choiceValues.addQuery("element", "type");
		choiceValues.query();

		while(choiceValues.next()) {
			// Identify language for this sys_choice entry
			var language = choiceValues.language;
			if (!language) {
				continue;
			}

			// Ensure a translation for the affected string exists (unless the language is en)
			if (language != "en") {
				var translation = new GlideRecord("sys_ui_message");
				if (type == "Blacklist")
					translation.addQuery("key", "Deny List");
				else
					translation.addQuery("key", "Allow List");
				translation.addQuery("language", language);
				translation.setLimit(1);
				translation.query();

				// Skip if no sys_message translation so we don't replace with the English translation
				if(!translation.hasNext()) {
					if (type == "Blacklist")
						gs.log("No translation exists for Deny List in " + language);
					else
						gs.log("No translation exists for Allow List in " + language);

					continue;
				}
			}

			if (type == "Blacklist")
				choiceValues.label = gs.getMessageLang("Deny List", language);
			else
				choiceValues.label = gs.getMessageLang("Allow List", language);

			choiceValues.setWorkflow(false);
			choiceValues.update();
		}
	}
})();
