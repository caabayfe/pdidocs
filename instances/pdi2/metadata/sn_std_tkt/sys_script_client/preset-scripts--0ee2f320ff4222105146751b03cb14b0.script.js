function onLoad() {
    var actionScript = "(function(inputs, outputs){\r\n // Add script here\r\n \r\n })(inputs, outputs);";
	var applicabilityScript = "(function(){\r\n // Add script here\r\n \r\n })();";
    presetScriptForField('action_script', actionScript);
    presetScriptForField('applicability_script', applicabilityScript);

    function presetScriptForField(fieldName, script) {
        var value = g_form.getValue(fieldName);
        if (!value) {
            g_form.setValue(fieldName, script);
        }
    }
}
