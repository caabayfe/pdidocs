(function executeRule(current, previous /*null when async*/ ) {

    //Delete promin_attachments
    var grProminAttachment = new GlideRecord("promin_attachment");
    grProminAttachment.addQuery('model_def_version', current.getUniqueValue());
    grProminAttachment.query();
    while (grProminAttachment.next()) {
        grProminAttachment.deleteRecord();
    }

    //Delete ML Solution Definition
    var grSolution = new GlideRecord("ml_solution");
    if (grSolution.get("progress_tracker", current.getValue("tracker"))) {
		var grSolutionDef = grSolution.ml_capability_definition.getRefRecord();
		if(grSolutionDef.isValidRecord()){
			grSolutionDef.deleteRecord();
		}
    }

})(current, previous);
