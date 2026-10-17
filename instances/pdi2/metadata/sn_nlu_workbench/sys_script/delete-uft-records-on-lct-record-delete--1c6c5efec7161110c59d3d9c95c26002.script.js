(function executeRule(current, previous /*null when async*/) {

	var uftGr = new GlideRecord('ml_label_user_feedback');
	uftGr.addQuery('utterance_reference', current.sys_id);
	uftGr.query();
	
	if (uftGr.next()) {
		uftGr.deleteRecord();
	}

})(current, previous);
