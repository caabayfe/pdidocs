function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var RUN_CLIENT_SCRIPT_SYS_ID = 'e16fffc367233110db9fb9770cf9224b';
	var EXECUTE_NOW_ASSIST_SKILL_SYS_ID = '4d665fe237212210e459a03174924bfa';

	if (newValue === '' || g_form.getValue('ui_rule') === '' || g_form.getValue('operation') === RUN_CLIENT_SCRIPT_SYS_ID) {
		g_form.setMandatory('target_mapping', false);
		g_form.setDisplay('target_mapping', false);
		return;
	}
	
	var uiRuleOperationService = new GlideAjax('UIRuleOperationService');
    uiRuleOperationService.addParam('sysparm_name', 'checkOperation');
	uiRuleOperationService.addParam('sysparm_ui_rule_operation_sys_id', newValue);
	uiRuleOperationService.getXML(setFieldsVisibility);

	function setFieldsVisibility(response) {
		var answer = JSON.parse(response.responseXML.documentElement.getAttribute('answer').toString());

		if (!answer.hasAccessToTable)
		    g_form.addErrorMessage('user does not have access to table "sys_sg_ui_rule_operation"');

		if (g_form.getValue('operation') === EXECUTE_NOW_ASSIST_SKILL_SYS_ID) {
			g_form.setLabelOf('value', getMessage('Skill Configuration'));
		} else if (answer.isOneExtendOperator) {
			g_form.setLabelOf('value', getMessage('Input Mapping'));
		} else {
			g_form.setLabelOf('value', getMessage('Value'));
		}

		if (answer.isOneExtendOperator && answer.hasMultipleOutputs) {
			g_form.setDisplay('target_mapping', true);
			g_form.setMandatory('target_mapping', true);
			g_form.setDisplay('target', false);
		} else {
			g_form.setMandatory('target_mapping', false);
			g_form.setDisplay('target_mapping', false);
			g_form.setDisplay('target', true);
		}
	}
}
