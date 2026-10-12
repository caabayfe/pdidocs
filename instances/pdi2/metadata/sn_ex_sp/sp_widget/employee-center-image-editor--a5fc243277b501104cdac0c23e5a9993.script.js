(function() {
	if (input) {
		data.description = input.description;
		
		data.placerholderIcon = input.placeholderIcon;
		if(typeof input.broadcastId !== 'undefined')
			data.broadcastId = input.broadcastId;
		else
			gs.info(gs.getMessage("Employee Center Image Editor: BroadcastId is empty, please specify the appropriate BroadcastId"));
		data.isCircularCrop = input.isCircularCrop || false;
		data.aspectRatio = input.aspectRatio || 1;
		data.dragMode = input.dragMode || 'crop';
		data.moveCropBox = input.isCropBoxMovable || false;
		data.resizeCropBox = input.isCropBoxResizable || false;
		data.viewMode = input.viewMode || 0;
		data.autoCropArea = input.autoCropArea || 0.7;
		
		if (input.editorMode === 'new') {
			data.isImagePresent = false;
			data.isFirstUpload = true;
			data.disableApplyButton = false;
			data.headerTitle = gs.getMessage("Add {0} image", input.imageType);
		} else {
			if(typeof input.imgToProcess !== 'undefined')
				data.imgSrc = input.imgToProcess;
			else
				gs.info(gs.getMessage("Employee Center Image Editor: Image is mandatory in Edit mode, please specify an image to process."));
			data.isImagePresent = true;
			data.isFirstUpload = false;
			data.disableApplyButton = true;
			data.headerTitle = gs.getMessage("Edit {0} image", input.imageType);
		}
	}
	var validImageFormats = ".jpg, .png, .bmp, .jpeg, .svg";
	data.removeMessage = gs.getMessage("Remove your {0} image", input.imageType);
	data.supportedFormats = gs.getMessage("Supported file types: {0}", validImageFormats);
	
})();
