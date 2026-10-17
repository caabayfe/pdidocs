function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    var DATE_FORMATTER_SYS_ID = '867cdd017322201050f787086bf6a74b';
    var DATE_CALCULATION_SYS_ID = '48b421865322201042bdddeeff7b1279';
    var DATE_TIME_INPUT_TYPE_SYS_ID = '2c0c605517021010f2b43b9fadb9590a';
	var SIMPLE_ARITHMETIC_SYS_ID = '98c6f6105b431010da168d8fa881c751';
	var RUN_CLIENT_SCRIPT_SYS_ID = 'e16fffc367233110db9fb9770cf9224b';
	
	if (shouldExcludeTarget()) {
		g_form.clearOptions('target');
		g_form.addOption('target', '', '-- None --');
		return;
	}
	
    var uiRuleActionTargetsProvider = new GlideAjax('UIRuleActionTargetsProvider');
    uiRuleActionTargetsProvider.addParam('sysparm_name', 'getTargets');
    uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_id', g_form.getValue('ui_rule'));

    if (newValue === DATE_FORMATTER_SYS_ID) {
        g_form.addInfoMessage("Select only DateTime elements in the Target field");
        uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_action_operation', 'text');
    } else if (newValue === DATE_CALCULATION_SYS_ID) {
        uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_input_filter', DATE_TIME_INPUT_TYPE_SYS_ID);
    } else if (newValue === SIMPLE_ARITHMETIC_SYS_ID){
		uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_action_include_variables', true);
	} else {
        g_form.clearMessages(); //When operation is other than "Date Formatter" or "Date Calculation" all elements should return
    }
    uiRuleActionTargetsProvider.getXML(addTargetChoicesOnChange);
	
	function shouldExcludeTarget() {
		return newValue === '' || g_form.getValue('ui_rule') === '' || newValue === RUN_CLIENT_SCRIPT_SYS_ID;
	}
	
	function addTargetChoicesOnChange(response) {	
        var currentTarget = g_form.getValue('target');	
        addTargetChoices(response);
        if (isLoading && currentTarget !== '')	
            g_form.setValue('target', currentTarget);	
    }
}
