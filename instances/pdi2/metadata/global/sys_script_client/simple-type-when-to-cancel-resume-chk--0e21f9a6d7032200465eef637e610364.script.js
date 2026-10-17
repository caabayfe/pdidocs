function onSubmit() {
    ScriptLoader.getScripts('SLAFormFunctions.jsdbx', function() {
        clearNonPermanentMessages();

        var simpleConditionTypeId = "d8e8f83a0a0a2c940052a3cac6c2b417";
        var defaultConditionClass = g_scratchpad.sla_metadata.default_conditionclass;
        var currentConditionClass = g_scratchpad.sla_metadata.current_conditionclass;

        if (g_form.getControl('condition_class') != undefined)
            currentConditionClass = g_form.getValue('condition_class');

        var usingSimple = currentConditionClass ? (currentConditionClass == simpleConditionTypeId) : (defaultConditionClass == "SLAConditionSimple");

        var fldMsg = '';
        if (!usingSimple)
            return true;

        if (g_form.getValue("when_to_resume") == 'on_condition')
            fldMsg = 'When to resume';

        if ((g_form.getValue("when_to_cancel") == 'on_condition') || (g_form.getValue("when_to_cancel") == 'never')) {
            if (fldMsg != '')
                fldMsg += ' / ';
            fldMsg += 'When to cancel';
        }

        if (fldMsg != '') {
            g_form.addErrorMessage(new GwtMessage().getMessage('{0} conditions cannot be used when the condition type is set to Simple. Update aborted.', fldMsg));
            return false;
        }

        return true;
    });

}
