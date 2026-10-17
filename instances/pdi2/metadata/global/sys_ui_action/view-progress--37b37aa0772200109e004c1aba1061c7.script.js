function showProgress() {
	var previewRecord = new GlideRecord('upgrade_preview');
	previewRecord.get(g_form.getUniqueValue());

	var map = new GwtMessage().getMessages(['Preview Progress']);
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass('hierarchical_progress_viewer', false, '40em', '10.5em');
	dd.setTitle(map['Preview Progress']);
	dd.setPreference('sysparm_renderer_execution_id', previewRecord.getValue('tracker'));

	dd.render();
}
