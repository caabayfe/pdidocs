var sel_user = quiz_taker;

doAssessment(sel_user);

function doAssessment(new_user) {
	
	var instanceId = "";
	if (type_id != "" && source_id != "") //This is an assessable record
		instanceId = new SNC.AssessmentCreation().createAssessments(type_id, source_id, new_user);
	else    // This is a survey or a metric type
	    instanceId = new SNC.AssessmentCreation().createAssessments(asmtr_sys_id, "", new_user);
	
	var gr = new GlideRecordSecure("asmt_assessment_instance");
	var success = gr.get(instanceId.substring(0,32));
	if(success){
		var infoMsg = gs.getMessage("The quiz has been assigned successfully.");
		gs.addInfoMessage(infoMsg);
	} else {
		var errMsg = gs.getMessage("The quiz could not be assigned.");
		gs.addErrorMessage(errMsg);
	}
	var urlOnStack = GlideSession.get().getStack().bottom();
	//PRB1088613 : adding these first_row params to reset to 1 as platform persists these in session and since we submit the parent page that row number from session is being set to related list
	urlOnStack = urlOnStack + '&sysparm_first_row=1&stackparm_sysparm_first_row=1';
	response.sendRedirect(urlOnStack);
}
