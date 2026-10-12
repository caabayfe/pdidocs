paDeleteRelatedBreakdownExclusion();
function paDeleteRelatedBreakdownExclusion() {
	var gr = new GlideRecord("pa_indicator_breakdown_excl");
	gr.addQuery("indicator", current.indicator);
	var qc = gr.addQuery("breakdown", current.breakdown);
	qc.addOrCondition("breakdown_level2", current.breakdown);
	gr.query();
	while (gr.next())
		gr.deleteRecord();
}
