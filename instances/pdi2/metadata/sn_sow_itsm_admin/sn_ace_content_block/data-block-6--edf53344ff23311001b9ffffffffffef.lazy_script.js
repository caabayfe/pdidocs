(function(context, pageParams, blockcontext){
    var selectedPlanName = "";
	var planDefGR = new GlideRecord("comm_plan_definition");
	planDefGR.addQuery("sys_id", blockcontext.selectedRecords[0]);
    planDefGR.query();
	if(planDefGR.next()) {
        selectedPlanName = planDefGR.getValue("name");
	}
    return {
        selectedPlanName: selectedPlanName,
        planCopyName: selectedPlanName + " copy"
    };
})(context, pageParams, blockcontext);
