
                        			function onCondition() {
    var advancedField = "advanced",
        scriptField = "interoperable_scripted_condition";
    // Set default script template for ScriptedCondition.
    var defaultScriptValue = "/*\n" +
        " *  @params {Object} params are limited to the required parameters of the route\n" +
        " *  @returns {boolean} true represents route is valid. false implies route is not valid" +
        " */\n" +
        "(function scriptedConditionFunction(params) {\n" +
        "    //route parameters available in the params object i.e: 'params.table' or 'params.sysId'\n" +
        "    //Your script below\n" +
        "})(inputProperties);";
    // Display Note for ScriptedCondition
    getMessage("Use an advanced scripted condition to determine when to display the shared route. When enabled, this script executes to evaluate the shared route, ignoring any usage conditions. The script can access the routes required parameters and must return true to render the shared page.", function(translatedMsg) {
		g_form.hideFieldMsg(advancedField, true);
        g_form.showFieldMsg(advancedField, translatedMsg);
    });
    var scriptValue = g_form.getValue(scriptField);
    if (!scriptValue) {
        g_form.setValue(scriptField, defaultScriptValue);
    }
}
