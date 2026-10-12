function onLoad() {
    var constants = {
        ADVANCED_CONDITION: 'advanced_condition',
        CONDITION: 'condition'
    };
    var glideAjax = new GlideAjax('sn_nb_action.RecommendedActionsAjax');
    glideAjax.addParam('sysparm_name', 'checkIfContextInputsExist');
    glideAjax.addParam('sysparm_contextSysId', g_form.getValue('rule_context'));
    glideAjax.addParam('sysparm_excludeContextTableInput', false);
    glideAjax.getXMLAnswer(function(answer) {
        if (answer === "true") {
            g_form.setMandatory(constants.CONDITION, false);
            g_form.setDisplay(constants.CONDITION, false);

            if ((g_form.getValue(constants.ADVANCED_CONDITION) == 'null' || g_form.getValue(constants.ADVANCED_CONDITION) == '') && (g_form.getValue(constants.CONDITION) != '' || g_form.getValue(constants.CONDITION) != 'null')) {
                glideAjax.addParam('sysparm_name', 'addContextTablePrefix');
                glideAjax.addParam('sysparm_contextSysId', g_form.getValue('rule_context'));
                glideAjax.addParam('sysparm_ruleQuery', g_form.getValue(constants.CONDITION));
                glideAjax.getXMLAnswer(function(answer) {
                    g_form.setValue(constants.ADVANCED_CONDITION, answer);
                    var message = getMessage("As the context inputs have been created, the existing conditions have been moved to the Advanced condition field, which supports conditions for both the context table and context inputs. Review, make any necessary modifications, and save to apply the changes.");
                    var type = "info";
                    g_form.addFormMessage(message, type);
                });
            }
        } else {
            g_form.setMandatory(constants.ADVANCED_CONDITION, false);
            g_form.setDisplay(constants.ADVANCED_CONDITION, false);
        }
    });


}
