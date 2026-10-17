function openDialog() {
	//Open overlay window with PIR UI page
	var o = new GlideOverlay({
		title: " PIR Report",
		form: 'PIR_Report',
		height: 500,
		width: 800
	});
	//Pass incident alert sys_id to the UI page
	o.setPreference("sysparm_record_sys_id", g_form.getUniqueValue());
	o.render();
}
