(function executeRule(current, previous /*null when async*/) {
	
	var col,val;
	
	if(current.operation() === "insert" || current.operation() === "update")
		val = true;
	else if(current.operation() === "delete")
		val = false;
	
	if(current.step_type.toString() === "intro")
		col = 'has_intro';
	else if(current.step_type.toString() === "concl")
		col = 'has_concl';
	
	var gr = new GlideRecord("sys_embedded_tour_guide");
	if(gr.get(current.guide)){
		gr.setValue(col,val);
		gr.update();
	}
	
})(current, previous);
