function onLoad() {
	if (g_form.getValue('applies_to') == '1')
	    //Hide index_stop_word on index group configuration form view
		g_form.hideRelatedList('ts_index_stop');
}
