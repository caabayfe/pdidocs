var gr = new GlideRecord('sys_properties');
gr.addQuery('name','glide.ui.report.old_report_builder');
gr.addQuery('value',true);
gr.query();

if (gr.next()) {
	gr.value = false;
	gr.update();
}
