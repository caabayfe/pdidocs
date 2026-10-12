function onChange() {
	if (g_form.getBooleanValue('mapped_facet')) {
		g_form.showRelatedList('sp_search_facet_filter');
	} else {
		g_form.hideRelatedList('sp_search_facet_filter');
	}
}
