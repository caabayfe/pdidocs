(function executeRule(current, previous /*null when async*/) {
	var supportedContentTypes = gs.getProperty("template_icon_supported_content_types", "image/svg+xml").split(",");
	
	current = new TemplateIconValidator(current, "icon", supportedContentTypes).validate();
})(current, previous);
