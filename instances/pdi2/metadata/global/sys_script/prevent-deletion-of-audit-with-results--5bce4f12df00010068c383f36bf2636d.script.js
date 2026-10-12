var grAuditResults = new GlideRecord("cert_audit_result");
grAuditResults.addQuery("audit", current.sys_id);
grAuditResults.setLimit(1);
grAuditResults.query();
if (grAuditResults.hasNext()) {
	gs.addErrorMessage(gs.getMessage("An audit cannot be deleted if it has results."));
	current.setAbortAction(true);
}
