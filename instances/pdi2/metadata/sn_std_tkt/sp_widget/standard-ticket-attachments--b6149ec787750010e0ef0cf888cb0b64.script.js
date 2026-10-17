(function() {
    data.sys_id = options.record_id || $sp.getParameter("sys_id");
    data.table = options.record_table || $sp.getParameter("table");
    data.read_only = options.read_only || false;
    if (input) {
        data.sys_id = input.sys_id;
        data.table = input.table;
    }

    data.appendToId = options.appendToId;
    data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
    if (isNaN(data.maxAttachmentSize))
        data.maxAttachmentSize = 24;
    data.attachmentSuccessMsg = gs.getMessage("Attachment successfully uploaded");
    data.noDragDropMsg = gs.getMessage("Attachment drap-and-drop not enabled - use attachment button");
    data.noAttachmentsMsg = gs.getMessage("There are no attachments");
    data.renameSuccessMsg = gs.getMessage("Attachment renamed successfully");
    data.deleteSuccessMsg = gs.getMessage("Attachment deleted successfully");
    if (!data.table || !data.sys_id)
        return;

    var gr = sn_std_tkt_api.TicketConfig.getTicketRecord(data.table, data.sys_id);

    if (gr == null)
        return;

	if (input && gr.canWrite()) {
		if (input.action == "deleted") {
			gr.comments = gs.getMessage("deleted an attachment");
			gr.update();
		}
		else if (input.action == "added") {
			gr.comments = gs.getMessage("added attachment");
			gr.update();
		}
		else if (input.action == "renamed") {
			gr.comments = gs.getMessage("renamed an attachment");
			gr.update();
		}
	}

    data.canWrite = gr.canWrite() && !data.read_only;
    data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && gr.getAttribute("no_attachment") != "true" && !data.read_only;
    data.canRead = gr.canRead();
    data.canDragAndDrop = gs.getProperty('glide.ui.attachment_drag_and_drop', 'true') === 'true' && !data.read_only;
})();
