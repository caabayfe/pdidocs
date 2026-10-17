function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var EXECUTE_NOW_ASSIST_SKILL_SYS_ID = '4d665fe237212210e459a03174924bfa';

    if (isLoading || newValue === '' || g_form.getValue('operation') != EXECUTE_NOW_ASSIST_SKILL_SYS_ID || !isValidJSON(newValue))
        return;

    var skillConfig = JSON.parse(newValue);
    var capabilityId = skillConfig.CapabilityId;
    if (!capabilityId)
        return;

    var uiRuleOperationService = new GlideAjax('UIRuleActionSkillConfigService');
    uiRuleOperationService.addParam('sysparm_name', 'checkCapability');
    uiRuleOperationService.addParam('sysparm_capability_id', capabilityId);
    uiRuleOperationService.getXML(setTargetMappingVisibility);

    function setTargetMappingVisibility(response) {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute('answer').toString());

        if (answer.hasMultipleOutputs) {
            g_form.setDisplay('target_mapping', true);
            g_form.setMandatory('target_mapping', true);
            g_form.setDisplay('target', false);
        } else {
            g_form.setMandatory('target_mapping', false);
            g_form.setDisplay('target_mapping', false);
            g_form.setDisplay('target', true);
        }
    }

    function isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
}
