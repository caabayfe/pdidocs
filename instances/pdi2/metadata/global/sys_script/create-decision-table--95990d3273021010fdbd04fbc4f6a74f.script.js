(function executeRule(current, previous /*null when async*/) {

	// Create Decision Table
	var gr = new GlideRecord("sys_decision");
	gr.initialize();
	gr.name= current.name;
	gr.answer_table = "sys_auth_policy_answer";
	var decision_tabel_sysId = gr.insert();
	current.decision_table = decision_tabel_sysId;

})(current, previous);
