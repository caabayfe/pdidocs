repairScriptIncludeCall("table", "PlatformEncryptedTables");
repairScriptIncludeCall("field", "PlatformEncryptedFields");
repairScriptIncludeCall("module", "PlatformEncryptionModules");

function repairScriptIncludeCall(fieldName, scriptName) {
    var oldScriptCall = "choice_script=new global." + scriptName + "().process(dependent_value)";
    var newScript = "";

    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_mass_encryption_job');
    gr.addQuery('element', fieldName);
    gr.query();

    if (gr.next()) {
        var attributesString = gr.getValue("attributes");
        if (attributesString.contains(oldScriptCall)) {
            var attributesArray = attributesString.split(",");

            for (var i = 0; i < attributesArray.length; i++) {
                if (attributesArray[i].contains(oldScriptCall)) {
                    var fullAttribute = attributesArray[i];
                    attributesArray[i] = fullAttribute.replace("dependent_value", "typeof dependent_value !== 'undefined' ? dependent_value : null");
                }
            }

            attributesString = attributesArray.join(",");
            gr.setValue("attributes", attributesString);
            gr.update();
        }

    }
}
