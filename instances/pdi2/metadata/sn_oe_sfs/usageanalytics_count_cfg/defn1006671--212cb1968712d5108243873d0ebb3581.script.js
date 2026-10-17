if (!GlideTableDescriptor.isValid('sys_cs_collab_member')) {
	answer = 0;
} else {
	var gr = new GlideAggregate('sys_cs_collab_member');
	gr.addEncodedQuery('frame_state!=closed^ORframe_state=NULL');
	gr.groupBy('member');
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
