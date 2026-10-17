function onAfter(current, previous) {
	var comment = new GlideRecord('kb_social_qa_comment');
	comment.addQuery('reference_name', current.reference_name);
	comment.addQuery('reference_id', current.reference_id);
	comment.addActiveQuery();
	comment.query();
	if(!comment.next()) {
		var gr = new GlideRecord(current.reference_name);
		if(gr.get(current.reference_id)) {
			gr.has_comment = false;
			if(current.reference_name == 'kb_social_qa_question') {
				gr.last_activity = new GlideDateTime();
			}
			gr.update();
		}
	}
}
