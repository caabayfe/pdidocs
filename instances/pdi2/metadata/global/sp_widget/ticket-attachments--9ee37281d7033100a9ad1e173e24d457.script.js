(function() {
	data.sys_id = input.sys_id || options.record_id || $sp.getParameter("sys_id");
	data.table = input.table || options.record_table || $sp.getParameter("table");
	data.appendToId = options.appendToId;
	data.table = _getActualTable(data.table, data.sys_id);
	data.supportedAttachmentExtensions = gs.getProperty("glide.attachment.extensions", '');
	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	data.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "" + data.maxAttachmentSize + "MB");
	data.attachmentSuccessMsg = gs.getMessage("Attachment successfully uploaded");
	data.noDragDropMsg = gs.getMessage("Attachment drap-and-drop not enabled - use attachment button");
	data.noAttachmentsMsg = gs.getMessage("There are no attachments");
	
	if (!data.table || !data.sys_id)
		return;

	var gr = new GlideRecord(data.table);
	if (!gr.isValid())
		return;
	
	if (!gr.get(data.sys_id))
		return;

	if (input && input.action == "deleted") {
		gr.comments = input.action + " an attachment";
		gr.update();
	}

	data.canWrite = gr.canWrite();
	data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && GlideTableDescriptor.get(data.table).getED().getAttribute("no_attachment") != "true";
	data.canRead = gr.canRead();
	data.canDragAndDrop = gs.getProperty('glide.ui.attachment_drag_and_drop', 'true') === 'true';

	function _getActualTable(table, id) {
		if (!table)
			return table;
		
		var rec = new GlideRecord(table);
		if (!rec.isValid())
			return table;
		
		if (rec.get(id) && rec.getValue('sys_class_name')) {
			return rec.getValue('sys_class_name');
		}
		return table;
	}
})();
