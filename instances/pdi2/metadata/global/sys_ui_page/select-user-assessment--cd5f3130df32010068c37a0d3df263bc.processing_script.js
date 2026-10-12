var sel_user = sys_user;
if ((sel_user == null || sel_user == '') && selected_values) {
	var users = selected_values.split(",");
	users.forEach(function(user) {
		doAssessment(user);
	});
} else
	doAssessment(sel_user);

	var urlOnStack = GlideSession.get().getStack().bottom();
	//PRB1088613 : adding these first_row params to reset to 1 as platform persists these and since we submit the parent page that row number from session is being set to related list
	urlOnStack = urlOnStack + '&sysparm_first_row=1&stackparm_sysparm_first_row=1';
	response.sendRedirect(urlOnStack);

function doAssessment(new_user) {

    if (asmtr_sys_id != ""){
        var metric_gr = new GlideRecordUtil().getGR("asmt_metric_type", asmtr_sys_id);
        if(!new AssessmentUtils().canUseUiAction(metric_gr))
		  return;
	}

    new SNC.AssessmentCreation().addRecentAssessor(new_user);
    var evalMethod = "";
    var instanceId = "";
    if (type_id != "" && source_id != "") //This is an assessable record
        instanceId = new SNC.AssessmentCreation().createAssessments(type_id, source_id, new_user);
    else // This is a survey or a metric type
        instanceId = new SNC.AssessmentCreation().createAssessments(asmtr_sys_id, "", new_user);

    var gr = new GlideRecord("asmt_assessment_instance");
    var success = gr.get(instanceId.substring(0, 32));
    if (success) {
        evalMethod = gr.getDisplayValue("metric_type.evaluation_method").toLowerCase();
        var infoMsg = gs.getMessage("The {0} has been assigned successfully.", evalMethod);
        gs.addInfoMessage(infoMsg);
    } else {
        var gr_metric = new GlideRecord("asmt_metric_type");
        var successMetricType = (type_id != "" && source_id != "") ? gr_metric.get(type_id) : gr_metric.get(asmtr_sys_id);
        evalMethod = successMetricType ? gr_metric.getDisplayValue("evaluation_method").toLowerCase() : '';
        if (evalMethod) {
            var errMsg = gs.getMessage("The {0} could not be assigned. For more information, contact your system administrator.", evalMethod);
            gs.addErrorMessage(errMsg);
        }
    }
}
