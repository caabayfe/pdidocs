// Get all targeted sys_choice entries
var choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "1");  // <---- Underlying choice value
choiceValues.addQuery("name", "pa_dimensions");
choiceValues.addQuery("element", "security_type");
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
        translation.addQuery("key", "Deny List"); // <---- Updated
        translation.addQuery("language", language);
        translation.setLimit(1);
        translation.query();

        // Skip if no sys_message translation so we don't replace with the English translation
        if(!translation.hasNext()) {
            gs.log("No translation exists for Deny list in " + language);
            continue;
        }
    }

    // DO NOT USE A VARIABLE FOR THE LABEL HERE! STRING PULL AUTOMATION NEEDS THE ACTUAL STRING.
    choiceValues.label = gs.getMessageLang("Deny List", language);
    choiceValues.setWorkflow(false);
    choiceValues.update();
}

choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "2");  // <---- Underlying choice value
choiceValues.addQuery("name", "pa_dimensions");
choiceValues.addQuery("element", "security_type");
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
        translation.addQuery("key", "Allow List"); // <---- Updated
        translation.addQuery("language", language);
        translation.setLimit(1);
        translation.query();

        // Skip if no sys_message translation so we don't replace with the English translation
        if(!translation.hasNext()) {
            gs.log("No translation exists for Allow List in " + language);
            continue;
        }
    }

    // DO NOT USE A VARIABLE FOR THE LABEL HERE! STRING PULL AUTOMATION NEEDS THE ACTUAL STRING.
    choiceValues.label = gs.getMessageLang("Allow List", language);
    choiceValues.setWorkflow(false);
    choiceValues.update();
}
