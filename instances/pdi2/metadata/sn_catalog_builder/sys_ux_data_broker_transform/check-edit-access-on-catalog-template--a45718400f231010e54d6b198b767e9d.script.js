function transform(input) {
	return new global.GlobalServiceCatalogUtil().canEditTemplate(input.templateId);
}
