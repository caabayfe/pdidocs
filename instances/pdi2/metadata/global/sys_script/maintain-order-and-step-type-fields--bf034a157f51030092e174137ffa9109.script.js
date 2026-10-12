(function executeRule(current, previous /*null when async*/) {

	var stepType = current.step_type.toString();
	
	if(stepType === 'step' || stepType === ''){
		
		if(stepType === ''){
			current.step_type = 'step';
		}
		
		var gr,gr1;
		if(current.active == true && current.order < 0){
			gr = new GlideAggregate('sys_embedded_tour_step');
			if(!gr.isValid)
				return;
			
			gr.addQuery('guide',current.guide);
			gr.addQuery('active', true);
			gr1 = gr.addQuery('step_type','step');
			gr1.addOrCondition('step_type','');
			gr.addAggregate('COUNT');
			gr.query();
			gr.next();
			
			var activeRows = gr.getAggregate('COUNT');
			current.order = parseInt(activeRows) + 1;
		}else if(current.active == false){
			current.order = -1;
		}
	}else{ //incase of welcome/conclusion modal step
		if(stepType === "intro" && current.order != 0){
			current.order = 0;
		}else if(stepType === "concl" && current.order != 999){
			current.order = 999;
		}
	}
	
})(current, previous);
