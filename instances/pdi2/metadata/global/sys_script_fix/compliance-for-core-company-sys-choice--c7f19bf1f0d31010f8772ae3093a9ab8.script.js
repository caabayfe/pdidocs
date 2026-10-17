// Get all targeted sys_choice entries
var choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "blacklist");  // <---- Underlying choice value
choiceValues.addQuery("name", "core_company");
choiceValues.addQuery("element", "rank_tier");
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
        translation.addQuery("key", "Excluded Supplier"); // <---- Updated
        translation.addQuery("language", language);
        translation.setLimit(1);
        translation.query();

        // Skip if no sys_message translation so we don't replace with the English translation
        if(!translation.hasNext()) {
            gs.log("No translation exists for <Excluded Supplier> in " + language);
            continue;
        }
    }

    // DO NOT USE A VARIABLE FOR THE LABEL HERE! STRING PULL AUTOMATION NEEDS THE ACTUAL STRING.
    choiceValues.label = gs.getMessageLang("Excluded Supplier", language);
    choiceValues.setWorkflow(false);
    choiceValues.update();
}
