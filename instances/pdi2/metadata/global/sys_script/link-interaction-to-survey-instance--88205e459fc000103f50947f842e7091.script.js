(function executeRule(current, previous /*null when async*/) {
	
	var assessmentInstanceGr = new GlideRecord("asmt_assessment_instance");
	if(assessmentInstanceGr.get(current.document_id)){
		assessmentInstanceGr.related_table_1 = "interaction";
		assessmentInstanceGr.related_id_1 = current.interaction;
		assessmentInstanceGr.related_table_2 = "sys_user";
		assessmentInstanceGr.related_id_2 = current.interaction.assigned_to;
		assessmentInstanceGr.update();
	}
		
})(current, previous);
