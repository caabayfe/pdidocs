(function executeRule(current, previous /*null when async*/) {
	
	if(current.step_type.toString() === "intro" || current.step_type.toString() === "concl"){
		var gr = new GlideRecord("sys_embedded_tour_step");
		gr.addQuery('guide',current.guide);
		gr.addQuery('step_type',current.step_type.toString());
		gr.query();
		
		if(gr.next()){
			if(current.step_type.toString() === "intro" && current.sys_id.toString() !== gr.getValue('sys_id')){
				gs.addErrorMessage("Cannot add multiple introduction modals");
				current.setAbortAction(true);
			}else if(current.step_type.toString() === "concl" && current.sys_id.toString() !== gr.getValue('sys_id')){
				gs.addErrorMessage("Cannot add multiple conclusion modals");
				current.setAbortAction(true);
			}
		}
	}
	
})(current, previous);
