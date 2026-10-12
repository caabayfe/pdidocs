(function executeRule(current, previous /*null when async*/) {
	var supportedContentTypes = gs.getProperty("sn_app_eng_studio.illustration_supported_content_types", "image/svg+xml").split(",");
	
	current = new ImageAttachmentValidator(current, "icon", supportedContentTypes).validate();
})(current, previous);
