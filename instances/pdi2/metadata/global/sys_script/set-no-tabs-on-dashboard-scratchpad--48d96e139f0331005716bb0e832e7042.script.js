function onDisplay(current, g_scratchpad) {
    var gr = new GlideRecord('pa_m2m_dashboard_tabs');
	gr.addQuery('dashboard', current.getValue('sys_id'));
	gr.setLimit(2);
	gr.query();
	g_scratchpad.hide_no_tabs = false;
	//Hide 'no_tabs' if at least 2 tabs present
	if (gr.next() && gr.next()) {
		g_scratchpad.hide_no_tabs = true;
	}
}
