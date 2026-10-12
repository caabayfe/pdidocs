function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }

    var defaultValue = g_form.getValue('default_value_helper');
    if (!defaultValue || defaultValue === 'NULL') return;
    if (!newValue) {
        setFieldValid('default_value_details');
    } else {
        var ga = new GlideAjax('global.QuestionCreationWizardUtils');
        ga.addParam('sysparm_name', 'validateRegex');
        ga.addParam('sysparm_value', defaultValue);
        ga.addParam('sysparm_regex_id', newValue);
        ga.getXML(handleResponse);
    }

    function handleResponse(serverResponse) {
        var answer = serverResponse.responseXML.documentElement.getAttribute("answer") || {};
        try {
            answer = JSON.parse(answer);
        } catch (error) {
            return;
        }
        var valid = answer.valid;
        g_form.hideFieldMsg('default_value_details', true);
        if (valid === false) {
            g_form.showFieldMsg('default_value_details', answer.message, 'error');
            g_form.$private.setFieldInvalid('default_value_details', true);
        } else {
            g_form.$private.setFieldInvalid('default_value_details', false);
        }
    }

    function setFieldValid(fieldName) {
        g_form.$private.setFieldInvalid(fieldName, false);
        g_form.hideFieldMsg(fieldName, true);
    }
}
