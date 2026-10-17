function executeDiagnostic(id) {
	var result = [];
	var job = new GlideAggregate('pa_job_indicators');
	job.addEncodedQuery('job.active=true^job.run_typeNOT INonce,on_demand');
	job.addQuery('collect_indicator', true);
	if (id)
		job.addEncodedQuery('indicatorIN' + id, true);
	job.addQuery('active', true);
	job.addAggregate('COUNT');
	job.groupBy('indicator');
	job.query();
	while (job.next()) {
		var widget = new GlideAggregate('pa_widgets');
		widget.addQuery('indicator', job.indicator);
		widget.query();
		if (!widget.next() && !isWidgetIndicatorExists(job.indicator) && !isWidgetIndicatorGroupUsed(job.indicator)) {
			//No widget refers to the indicator.
			var indicator = new GlideRecord('pa_indicators');
			indicator.addQuery('type', 2);
			indicator.addQuery('formula', 'CONTAINS', job.indicator);
			indicator.query();
			if (!indicator.next()) {
				//No formula refers to the indicator.
				result.push(job.indicator.toString());
			}
		}
	}
	return result.join(',');
}

function isWidgetIndicatorExists(indicatorSysID) {
	var widgetIndicator = new GlideRecord('pa_widget_indicators');
	widgetIndicator.addQuery('indicator', indicatorSysID);
	widgetIndicator.query();
	return widgetIndicator.hasNext();
}

function isWidgetIndicatorGroupUsed(indicatorSysID) {
	var widgetGroup = new GlideAggregate('pa_m2m_indicator_tags');
	widgetGroup.addQuery('indicator', indicatorSysID);
	widgetGroup.groupBy('tag');
	widgetGroup.query();
	var groups = [];
	while (widgetGroup.next()) {
		groups.push(widgetGroup.getValue('tag'));
	}
	var widget = new GlideAggregate('pa_widgets');
	widget.addQuery('tag', 'IN', groups.join(','));
	var qc = widget.addQuery('type', 'list');
	qc.addOrCondition('type', 'time').addCondition('visualization', 'relative');
	widget.query();
	return widget.hasNext();
}

executeDiagnostic(id);
