function transform(input) {
	var experienceProperties = input.experienceProperties || {};

	var form_view = experienceProperties.form_view || {};
	var template_fields = experienceProperties.template_fields || {};
	var form_fields = experienceProperties.form_fields || { value: "" };

	var advanced = input.advanced || {};
	var formApi = advanced.formApi || {};

	var formFieldsRequired = advanced.inUIBuilder ? true : input.formFieldsRequired === true;

	return {
		table: input.associatedTable,
		sysId: input.associatedRecord,
		forcedViewName: form_view.value || "",
		query: template_fields.value || "",
		fieldInclusionList: form_fields.value && form_fields.value.length
			? form_fields.value.split(",")
			: [],
		showFieldList: !formFieldsRequired,
		legacyWorkspaceId: advanced.workspaceConfigId,
		validateRequested: formApi.requestValidation,
		refreshRequested: formApi.requestReload,
		submitAction: formApi.requestSubmitAction,
		userSession: advanced.userSession
	};
}
