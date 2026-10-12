(function refineQuery(current, parent) {

    var desc = new GlideTableDescriptor('syslog_transaction');
    var element = desc.getElementDescriptor('interaction_id');
	current.addNullQuery('parent');
    if (element) {
        current.addNotNullQuery('interaction_id');
        current.addQuery('interaction_id', parent.interaction_id);
    }else{
		current.addQuery('sys_id', parent.sys_id);
	}


})(current, parent);
