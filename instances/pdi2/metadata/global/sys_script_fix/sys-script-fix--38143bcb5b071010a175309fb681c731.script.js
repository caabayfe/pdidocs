var choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "master_screen_parameter");
choiceValues.addQuery("name", "sys_sg_embedded_screen_map");
choiceValues.addQuery("element", "type");
choiceValues.query();

while(choiceValues.next()) {
	var language = choiceValues.language;
	if (!language)
		continue;
		
	if (language != "en") {
		var translation = new GlideRecord("sys_ui_message");
		translation.addQuery("key", "Main screen parameter");
		translation.addQuery("language", language);
		translation.setLimit(1);
		translation.query();

		// Skip if no sys_message translation so we don't replace with the English translation
		if(!translation.hasNext()) {
			gs.log("No translation exists for Main screen parameter in " + language);
			continue;
		}
	}

	choiceValues.label = gs.getMessageLang("Main screen parameter", language);
	choiceValues.setWorkflow(false);
	choiceValues.update();
}
