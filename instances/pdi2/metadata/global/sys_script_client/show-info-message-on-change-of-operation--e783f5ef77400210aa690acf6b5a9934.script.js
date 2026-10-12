function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var RUN_CLIENT_SCRIPT_SYS_ID = 'e16fffc367233110db9fb9770cf9224b';
	var ON_LOAD_TRIGGER_SYS_ID = 'fd680bd85b431010da168d8fa881c7c8';

	if (!isLoading && newValue === RUN_CLIENT_SCRIPT_SYS_ID) {
		var uiRuleSysId = g_form.getValue('ui_rule');
        var uiRuleGR = new GlideRecord('sys_sg_ui_rule');
        if (uiRuleSysId && uiRuleGR.get(uiRuleSysId)) {
            var triggers = uiRuleGR.getValue('trigger');
            if (triggers && triggers.includes(ON_LOAD_TRIGGER_SYS_ID))
				g_form.addInfoMessage(getMessage("Failed action. Run client script doesn’t allow UI rules containing onLoad."));
        }
	}   
}
