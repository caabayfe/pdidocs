(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var onCallGroupTemplateId = request.queryParams.on_call_group_template_id;

	var ocCreationWizard = new OnCallCreationWizardUtils();
	return ocCreationWizard.getShiftTemplates(onCallGroupTemplateId);

})(request, response);
