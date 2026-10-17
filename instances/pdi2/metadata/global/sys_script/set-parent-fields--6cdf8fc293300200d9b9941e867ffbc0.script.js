(function executeRule(current, previous /*null when async*/) {
	
	var related_list_id = current.sys_ui_related_list.toString();
	if(current.list_id.nil())
		current.list_id = related_list_id;
	if(current.related_list.nil())
		current.related_list = 'REL:' + current.sys_relationship.toString();
	if(current.position.nil()) {
		var position = -1;
		var gr = new GlideAggregate('sys_ui_related_list_entry');
		gr.addAggregate('max', 'position');
		gr.groupBy('list_id');
		gr.addQuery('list_id', related_list_id);
		gr.query();
		if(gr.next())
			position = gr.getAggregate('max', 'position');
		current.position = parseInt(position) + 1;
	}
	
})(current, previous);
