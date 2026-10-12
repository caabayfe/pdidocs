function onAfter(current, previous) {
   if (previous && current.managing_indicator == previous.managing_indicator)
	   return;
	
	var gr;
	if (current.managing_indicator) {
		gr = new GlideRecord('pa_indicators');
		gr.get(current.managing_indicator);
		gr.setValue('has_managed_indicators', true);
		gr.update();
	}
	
	if (previous && previous.managing_indicator) {
		gr = new GlideRecord('pa_indicators');
		gr.addQuery('managing_indicator', previous.managing_indicator);
		gr.query();
		if (!gr.next()) {
			gr = new GlideRecord('pa_indicators');
			gr.get(previous.managing_indicator);
			gr.setValue('has_managed_indicators', false);
			gr.update();
		}
	}
}
