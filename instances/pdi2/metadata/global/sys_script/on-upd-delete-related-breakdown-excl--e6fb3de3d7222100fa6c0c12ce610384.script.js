paUpdateRelatedBreakdownExclusion();
function paUpdateRelatedBreakdownExclusion() {
	var gr = new GlideRecord("pa_indicator_breakdown_excl");
	gr.addQuery("indicator", current.indicator);
	var qc = gr.addQuery("breakdown", previous.breakdown);
	qc.addOrCondition("breakdown_level2", previous.breakdown);
	gr.query();
	while (gr.next())
		gr.deleteRecord();
}
