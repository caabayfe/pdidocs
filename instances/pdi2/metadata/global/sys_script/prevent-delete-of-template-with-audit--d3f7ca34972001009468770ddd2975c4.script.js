var gr = new GlideRecord("cert_audit");
gr.addQuery("template", current.sys_id);
gr.setLimit(1);
gr.query();
if (gr.hasNext()) {
	gs.addErrorMessage(gs.getMessage("Template {0} version {1} cannot be deleted when associated to an Audit.", [current.name, current.record_version]));
	current.setAbortAction(true);
}
else if (current.active && current.record_version == SNC.VersionControl.getLatestVersion(current))
		SNC.VersionControl.activatePrevious(current);
