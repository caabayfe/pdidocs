(function() {
	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	data.maxAttachmentSize = isNaN(data.maxAttachmentSize) ? 1024 : data.maxAttachmentSize;
	data.allowedExtensions = gs.getProperty("glide.attachment.extensions", '');
	data.dynamicMessages = {
		showMore: gs.getMessage('+ {0} more'),
		confirmDelete: gs.getMessage('Are you sure you want to delete "{0}"?'),
		maxUploadSize: gs.getMessage("Attached files must be smaller than {0} - please try again"),
		allowedExtensions: gs.getMessage("Attached files must have one of the allowed extensions ({0}) - please try again", data.allowedExtensions)
	}
})();
