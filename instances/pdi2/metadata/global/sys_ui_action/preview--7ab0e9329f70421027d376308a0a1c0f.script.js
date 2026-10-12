function previewHtml() {
   var previewDialog = new GlideModal('preview_rtbi_report');
	previewDialog.setTitle(getMessage("Preview {0}").withValues([g_form.getValue('name')]));
	previewDialog.setPreference('sysparm_report_id', g_form.getUniqueValue());
	previewDialog.render();
	
}
