function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    var DATE_FORMATTER_SYS_ID = '867cdd017322201050f787086bf6a74b';
    var DATE_CALCULATION_SYS_ID = '48b421865322201042bdddeeff7b1279';
    var DATE_TIME_INPUT_TYPE_SYS_ID = '2c0c605517021010f2b43b9fadb9590a';
	var RUN_CLIENT_SCRIPT_SYS_ID = 'e16fffc367233110db9fb9770cf9224b';

	
	if (shouldExcludeTargets()) {
		g_form.clearOptions('target');
		g_form.addOption('target', '', '-- None --');
		return;
	}
	
	var uiRuleActionTargetsProvider = new GlideAjax('UIRuleActionTargetsProvider');
	uiRuleActionTargetsProvider.addParam('sysparm_name', 'getTargets');
	uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_id', newValue);
	
	var operationValue = g_form.getValue('operation');
	if (operationValue === DATE_FORMATTER_SYS_ID) {
        g_form.addInfoMessage("Select only DateTime elements in the Target field");
        uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_action_operation', 'text');
    } else if (operationValue === DATE_CALCULATION_SYS_ID) {
        uiRuleActionTargetsProvider.addParam('sysparam_ui_rule_input_filter', DATE_TIME_INPUT_TYPE_SYS_ID);
    } else {
        g_form.clearMessages(); //When operation is other than "Date Formatter" or "Date Calculation" all elements should return
    }
	
	uiRuleActionTargetsProvider.getXML(addTargetChoicesOnChange);
	
	function shouldExcludeTargets() {
		return newValue === '' || g_form.getValue('operation') === '' || g_form.getValue('operation') === RUN_CLIENT_SCRIPT_SYS_ID;
	}

	function addTargetChoicesOnChange(response) {	
        var currentTarget = g_form.getValue('target');	
        addTargetChoices(response);	
        if (isLoading && currentTarget !== '')	
            g_form.setValue('target', currentTarget);	
    }
}
