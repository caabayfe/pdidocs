function onBefore(current, previous) {
    if (!current.managing_indicator || current.managing_indicator == '')
		return;

    var gr = new GlideRecord('pa_indicators');
    gr.addQuery('managing_indicator', current.managing_indicator);
	gr.addQuery('managed_breakdown', current.managed_breakdown);
	gr.addQuery('managed_element', current.managed_element);
	if (current.sys_id)
		gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage("A managed indicator already exists for these Managed Source values"));
		current.setAbortAction(true);
	}
}
