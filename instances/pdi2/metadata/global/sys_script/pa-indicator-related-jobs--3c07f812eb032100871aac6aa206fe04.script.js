updateIndicatorCount(current.indicator);

function updateIndicatorCount(indicator) {
	var rec = new GlideRecord('pa_indicators');
	if (!rec.get(indicator))
		return;
	
	if (GlideDomainSupport.getCurrentDomainValueOrGlobal() != rec.sys_domain)
		return;
	
	var gr = new GlideAggregate('pa_job_indicators');
	gr.addQuery("indicator", indicator);
	gr.addAggregate('COUNT');
	gr.query();
	var count = gr.next() ? gr.getAggregate('COUNT') : 0;
	
	rec.related_jobs = count;
	rec.update();
}
