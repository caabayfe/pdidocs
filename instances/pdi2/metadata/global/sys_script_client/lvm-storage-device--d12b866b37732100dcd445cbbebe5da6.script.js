function onLoad() {
	if (typeof g_scratchpad.hideRelatedLists !== 'undefined') {
		for (var i = 0; i < g_scratchpad.hideRelatedLists.length; ++i)
			g_form.hideRelatedList(g_scratchpad.hideRelatedLists[i]);
	}
}
