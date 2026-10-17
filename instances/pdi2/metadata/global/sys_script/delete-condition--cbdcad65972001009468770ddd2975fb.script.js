var template = new GlideRecord('cert_template');
if (template.get(current.cert_template.sys_id)) {
	current.original_id = "deleted";  // need to update cert_template
	SNC.VersionControl.updatePreventingBR(current);
	current.setAbortAction(true);
}
