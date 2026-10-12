(function() {
	var ATTACHMENT_LIMIT = 20;
	
	data.attachments = [];
	
	data.table = input ? input.table : options.table;
	data.filter = input ? input.filter : options.filter;
	data.allowRenameOrDelete = input ? input.allowRenameOrDelete != false : options.allowRenameOrDelete != false;
	data.hideIfEmpty = input ? input.hideIfEmpty != false : options.hideIfEmpty != false;

	data.displayWidget = data.table && data.filter;
	
	if (!data.displayWidget || !input)
		return;
	
	var gsa = new GlideSysAttachment();
	var gr = new GlideRecord(data.table);
	gr.addEncodedQuery(data.filter, true);
	gr.query();
	
	
	while (gr.next() && data.attachments.length < ATTACHMENT_LIMIT) {
		var grAttachment = gsa.getAttachments(data.table, gr.sys_id);
		
		while (grAttachment.next() && data.attachments.length < ATTACHMENT_LIMIT) {
			if (grAttachment.canRead())
				data.attachments.push(getAttachmentInfo(grAttachment));
		}
	}

	function getAttachmentInfo(grAttachment) {
		var attachment = {
			"file_name": grAttachment.getValue('file_name'),
			"size" : getSize(grAttachment.size_bytes),
			"table_name": grAttachment.getValue('table_name'),
			"table_sys_id": grAttachment.getValue('table_sys_id'),
			"sys_id": grAttachment.getUniqueValue(),
			"sys_updated_on": grAttachment.getValue('sys_created_on'),
			"canDelete": data.allowRenameOrDelete && grAttachment.canDelete(),
			"canWrite": data.allowRenameOrDelete && grAttachment.canWrite(),
			"state": grAttachment.getValue('state')
		};
		
		if (grAttachment.content_type.toLowerCase().startsWith('image') && !grAttachment.content_type.contains('tiff'))
			attachment.thumbSrc = attachment.sys_id + ".iix?t=medium";
		
		return attachment;
	}
	
	function getSize(sizeInBytes) {
		if (sizeInBytes >= 1024 * 1024 * 1024)
			return parseFloat(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
		else if (sizeInBytes >= 1024 * 1024)
			return parseFloat(sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
		else if (sizeInBytes >= 1024)
			return parseFloat(sizeInBytes / 1024).toFixed(1) + ' KB';
			
		return sizeInBytes + ' B';
	}

})();
