(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("m2m_kb_feedback_likes");
	gr.addQuery("comment",current.comment);
	gr.addQuery("user",current.user);
	gr.query();
	if(gr.hasNext())
		current.setAbortAction(true);

})(current, previous);
