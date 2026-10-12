var gr = new GlideRecord("sys_csrf_public_apis_violation");
if (gr.isValid()) {
	var days = gs.getProperty("glide.csrf.violations.cleanup.days", 90);
	var d = new GlideDateTime();
	d.addDaysUTC(-days);
	gr.addQuery("sys_created_on", "<", d.toString());
	gr.deleteMultiple();
}
