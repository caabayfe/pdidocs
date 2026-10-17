function onSubmit() {
    function isTemplateValueNotExistsOrReadOnly() {
        var templateFieldHandler = g_form.elementHandlers[g_form.getTableName() + ".template_value"];
        // template field doesn't exist
        if (!templateFieldHandler || !templateFieldHandler.getFilterReadOnly)
            return true;

        return templateFieldHandler.getFilterReadOnly();
    }

	//return true if submit is triggered by 'Add/Remove multiple' of glide_list field
	if (g_form.getActionName() !== "" && !gel(g_form.getActionName()))
		return true;

	if (g_scratchpad.templateValueValidated + "" === "true") {
		delete g_scratchpad.templateValueValidated;
		return true;
	}
	
    //do not validate if template_value is readonly, if the state is New or if we're Retiring a template
    if (isTemplateValueNotExistsOrReadOnly() || g_form.getValue('state') === "1" || g_form.getValue("proposal_type") === "3")
        return true;

    var stdChgUtils = new GlideAjax("StdChangeUtils");
    stdChgUtils.addParam("sysparm_name", "validateTemplateValue");
    stdChgUtils.addParam("sysparm_template_value", g_form.getValue("template_value"));
    stdChgUtils.getXMLAnswer(checkValidationResult);

    return false;
}

function checkValidationResult(validationResultJSON) {
    var validationResult = JSON.parse(validationResultJSON);

    if (validationResult.validationPassed + "" === "true" || validationResult.errorMsgs.length === 0)
        submitForm();

    for (var i = 0; i < validationResult.errorMsgs.length; i++)
        g_form.addErrorMessage(validationResult.errorMsgs[i]);
}

function submitForm() {
    g_scratchpad.templateValueValidated = true;
    var action = gel(g_form.getActionName());
    if (action)
        gsftSubmit(action);
    else
        g_form.submit();
}
