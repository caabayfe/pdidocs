(function executeRule(current, previous /*null when async*/) {
	var attributes = JSON.parse(current.getValue("attributes"));
	if(!JSUtil.nil(attributes.message_for_parent_flow) && sourceRecordExists(current.getValue("source_record"))){
		var gpa = new sn_ph.GlideProcessAutomation(current.getValue("source_record"));
		gpa.message(attributes.message_for_parent_flow);
	}

	function sourceRecordExists(source_record){
		if(source_record == null) 
			return false;
		var gr = new GlideRecord('sys_flow_context');
		return gr.get(source_record);
	}
})(current, previous);
