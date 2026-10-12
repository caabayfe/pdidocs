(function executeRule(current, previous /*null when async*/) {
	if(!GlidePluginManager.isActive("com.glide.domain") && gs.getProperty("glide.sys.domain.delegated_administration"))
		return;
	
	if(current.getValue("sys_overrides")==null || current.getValue("sys_overrides").toString()=='')
		return;
		
	var TOUR_STEP_TABLE = 'sys_embedded_tour_step';
	var TOUR_ELEMENT_TABLE = 'sys_embedded_tour_element';
	var overridingTourSysID = current.getValue("sys_overrides");
		
	var tour = {
		'tour_id' : overridingTourSysID
	};
		
	var steps = new sn_tourbuilder.TourBuilderDetails().getTourDetails(tour);
	var step;
		
	for(step in steps){
		var stepCols = new sn_tourbuilder.TourBuilderDictionary().getColumnsFromDictionary(TOUR_STEP_TABLE);
		var stepCol;
		
		var obj = steps[step];
		var actionTargetRefSysId = obj['actionTargetRef']['sysId'];
		var targetRefSysId = obj['targetRef']['sysId'];
		
		var stepObj = {};
		stepObj['action_target_ref'] = '';
		stepObj['target_ref'] = '';
		
		for(stepCol in stepCols){
			if(stepCol == 'guide' || stepCol == 'sys_id')
				continue;
			
			if(stepCol == 'action_target_ref' || stepCol == 'target_ref'){
				if((actionTargetRefSysId == targetRefSysId) && stepObj['action_target_ref']!= '' && stepObj['target_ref']!='')
				   continue;
				
				var stepElement = obj[stepCols[stepCol]];
				var elementObj = {};
				
				var elementCols = new sn_tourbuilder.TourBuilderDictionary().getColumnsFromDictionary(TOUR_ELEMENT_TABLE);
				var elementCol;
				
				for(elementCol in elementCols){
					if(elementCol == 'sys_id')
						continue;
					
				   if(stepElement[elementCols[elementCol]] !== undefined && stepElement[elementCols[elementCol]] !== '')
					 elementObj[elementCol] = stepElement[elementCols[elementCol]];
				}
				
				var elementObject = {};
				elementObject.guidedToursElement = elementObj;
				var elementSysId = new sn_tourbuilder.TourBuilderRecorder().saveElement(elementObject);
				
				if(actionTargetRefSysId == targetRefSysId){
					stepObj['action_target_ref'] = elementSysId.guidedTourSysId;
					stepObj['target_ref'] = elementSysId.guidedTourSysId;
				}else
					stepObj[column] = elementSysId.guidedTourSysId;
			} else
				stepObj[stepCol] = obj[stepCols[stepCol]];
		}
		
		var stepObject = {};
		stepObject.guidedTourStep = stepObj;
		stepObject.tourId = current.sys_id;
		
		var stepSysId = new sn_tourbuilder.TourBuilderRecorder().saveStep(stepObject);
	}
	
})(current, previous);
