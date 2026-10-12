if (!GlideTableDescriptor.isValid('sys_cs_collab_member')) {
	answer = 0;
} else {
	var gr = new GlideAggregate('sys_cs_collab_member');
	gr.addEncodedQuery('sys_created_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()');
	gr.addQuery('active', true);
	gr.groupBy('collab_chat');
	gr.addAggregate('COUNT');  
	gr.query();
if (!gr.hasNext()) {
	answer = 0;
} else {
	var sum = 0;
	while(gr.next()) {
		sum += parseInt(gr.getAggregate('COUNT'));
	}
	answer = sum / gr.getRowCount();
}
}
