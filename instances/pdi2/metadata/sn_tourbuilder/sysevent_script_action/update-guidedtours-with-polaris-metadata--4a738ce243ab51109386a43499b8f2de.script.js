//Same logic is present in sys_script_fix_5489e23053359110f54fddeeff7b1213
var mapper = new TourNextExpMapper();
var gr = new GlideRecord("sys_embedded_tour_step");
gr.addQuery("window", "nav_to.do");
gr.query();

while(gr.next()) {
	var targetRefGr = gr.target_ref.getRefRecord();
	if(targetRefGr.isValidRecord() && !targetRefGr.js_path && !targetRefGr.seismic_selector) {
		var nextExpSelector = mapper.getNextExpSelector(targetRefGr.manual_css.toString());
		if(nextExpSelector) {
			targetRefGr.js_path = nextExpSelector.jsPath;
			targetRefGr.seismic_selector = nextExpSelector.seismicSelector;
			targetRefGr.update();
		}
	}
}
