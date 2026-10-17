answer = getAttachmentCreateAnswer();

function getAttachmentCreateAnswer() {
	if (current.table_name == 'ds_document_version')
		return true;
	return false;
}
