function onLoad() {
    if (g_form.isNewRecord()) {
        var ruleScript = "//ADD RULES LIKE THIS 'var rule1 = {'hint': gs.getMessage('Minimum 8 characters'),'regex':'^.{8,}$'};' \n" +
            "//AND PUSH THEM IN THE RULES ARRAY FOR ADDING NEW RULES.  \n" +
            "(function executePasswordRuleScript() { \n" +
            "var rules = new Array(); \n" +
            "var rule1 = {'hint': gs.getMessage('Minimum 8 characters'),'regex':'^.{8,}$'}; \n" +
            "var rule2 = {'hint': gs.getMessage('Maximum 12 characters'),'regex':'^.{0,12}$'}; \n" +
            "var rule3 = {'hint': gs.getMessage('Atleast 1 special character from these options @$'),'regex': '((.*?[@$]).*?)'}; \n" +
            "rules.push(rule1, rule2, rule3); \n" +
            "return rules; \n" +
            "})(); \n";

        var strengthScript = "//DO NOT MODIFY THE KEYS OF OPTIONS, ONLY MODIFY THE VALUES. \n" +
            "\n" +
            "(function executeStrengthScript() { \n" +
            "var options = {}; \n" +
            "options['minimum_number_of_characters'] = 8; \n" +
            "options['unique_character_count_starts_after'] = 4; \n" +
            "options['number_of_similar_ascending_descending_count'] = 3; \n" +
            "options['minimum_special_characters'] = 2; \n" +
            "return options; \n" +
            "\n" +
            "})(); \n";

        var policyScript = "(function executeScript() { \n" +
            "var options = {}; \n" +
            "/* \n" +
            "options['minimun_password_length'] = 8; \n" +
            "options['maximum_password_length'] = 40; \n" +
            "options['minimum_uppercase_characters'] = 1; \n" +
            "options['minimum_lowercase_characters'] = 1; \n" +
            "options['minimum_numeric_characters'] = 1; \n" +
            "options['minimum_special_characters'] = 0; \n" +
            "*/ \n" +
            "return isValid(options) ? options : {}; \n" +
            "\n" +
            "// DO NOT MODIFY THIS VALIDATION METHOD \n" +
            "function isValid(options) { \n" +
            "if (options && Object.keys(options).length > 0) { \n" +
            "for (x in options) { \n" +
            "if (isNaN(options[x])) { \n" +
            "gs.error('PasswordPolicy: ' + x + ' is not a number = ' + options[x]); \n" +
            "return false; \n" +
            "} \n" +
            "} \n" +
            "} \n" +
            "return true; \n" +
            "} \n" +
            "\n" +
            "})(); \n";

        g_form.setValue('password_rule_script', ruleScript);
        g_form.setValue('password_strength_script', strengthScript);
        g_form.setValue('password_policy_script', policyScript);
    }
}
