if (GlideTableDescriptor.isValid('kb_knowledge')) {
	
	var today = gs.daysAgo(0);
	var twoWeeksFromToday = gs.daysAgo(-14);
	var gr = new GlideRecord('kb_knowledge');
	gr.addQuery('valid_to', '>', today);
	gr.addQuery('valid_to', '<=', twoWeeksFromToday);
	gr.query();
	answer = gr.getRowCount();
} else {
	answer = 0;
}
