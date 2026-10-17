function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;

	// Wait for the progress bar finished, then start download
	setTimeout(download,1000);
}

function download() {
	if (hasAttachment())
		window.location.href = window.location.protocol + "//" + window.location.host + '/download_logs.do?sysparm_sys_id=' + g_form.getUniqueValue();

}

function hasAttachment() {
	var attachmentRecord = new GlideRecord("sys_attachment");
	attachmentRecord.addQuery('table_name', 'node_log_download_info');
	attachmentRecord.addQuery('table_sys_id', g_form.getUniqueValue());
	attachmentRecord.query();
	return attachmentRecord.hasNext();
}
