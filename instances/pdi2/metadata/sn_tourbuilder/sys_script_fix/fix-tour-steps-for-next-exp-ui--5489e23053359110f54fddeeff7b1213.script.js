function fixStepTargetRef() {
	var mapper = new TourNextExpMapper();
	var gr = new GlideRecord("sys_embedded_tour_step");
	gr.addQuery("window", "nav_to.do");
	gr.query();
	
	while(gr.next()) {
		var targetRefGr = gr.target_ref.getRefRecord();
		if(targetRefGr.isValidRecord()) {
			var nextExpSelector = mapper.getNextExpSelector(targetRefGr.manual_css.toString());
			if(nextExpSelector) {
				targetRefGr.js_path = nextExpSelector.jsPath;
				targetRefGr.seismic_selector = nextExpSelector.seismicSelector;
				targetRefGr.update();
			}
		}
	}
}
fixStepTargetRef();
