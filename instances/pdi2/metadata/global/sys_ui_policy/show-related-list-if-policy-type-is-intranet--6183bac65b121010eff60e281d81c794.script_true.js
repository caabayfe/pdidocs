function onCondition() {
	g_form.showRelatedList('REL:6b49c6c15b121010eff60e281d81c716'); // Intranet record
	g_form.hideRelatedList('REL:5d5620d25b11111000d30e281d81c798'); // Match ecc_agent record to sec policy of *.servicenow.com
	g_form.hideRelatedList('REL:3a27dcf65b21111000d30e281d81c7a8'); // Mismatch ecc_agent record to sec policy of *.servicenow.com
}
