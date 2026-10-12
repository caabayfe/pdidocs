answer = getDVAttachmentReadAnswer();

function getDVAttachmentReadAnswer() {
	if (current.table_name == 'sys_document_viewer_status') {
		var statusGr = new GlideRecord('sys_document_viewer_status');
		statusGr.get(current.table_sys_id);
		if (statusGr.isValid()) {
			var parentAttachmentGr = new GlideRecord('sys_attachment');
			parentAttachmentGr.get(statusGr.attachment_id);
			if (parentAttachmentGr.isValid())
				return parentAttachmentGr.canRead();
			else
				return false;
		} else
			return false;
	}
	return false;
}
