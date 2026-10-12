var choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "master_item_field");
choiceValues.addQuery("name", "sys_sg_embedded_screen_map");
choiceValues.addQuery("element", "type");
choiceValues.query();

while(choiceValues.next()) {
	var language = choiceValues.language;
	if (!language)
		continue;
	
	if (language != "en") {
		var translation = new GlideRecord("sys_ui_message");
		translation.addQuery("key", "Item configuration field");
		translation.addQuery("language", language);
		translation.setLimit(1);
		translation.query();

		if(!translation.hasNext()) {
			gs.log("No translation exists for Item configuration field in " + language);
			continue;
		}
	}

	choiceValues.label = gs.getMessageLang("Item configuration field", language);
	choiceValues.setWorkflow(false);
	choiceValues.update();
}
