(function executeRule(current, previous) {
	var gr = new GlideRecord('cmdb_rel_type');
	var parentDescriptorKey = 'parent_descriptor';
	var childDescriptorKey = 'child_descriptor';
	//trim spaces
	var parentDescriptor = current.getValue(parentDescriptorKey).trim();
	var childDescriptor = current.getValue(childDescriptorKey).trim();
	//set trimmed values back to current object
	current.setValue(parentDescriptorKey, parentDescriptor);
	current.setValue(childDescriptorKey, childDescriptor);
	gr.addQuery(parentDescriptorKey, parentDescriptor);
    gr.addQuery(childDescriptorKey, childDescriptor);
	if( current.operation() == "update" ) {
        gr.addQuery('sys_id','!=', current.getValue('sys_id'));
    }

	gr.query();
	if( gr.next() ) {
    var message = gs.getMessage('Duplicate Relationship Type record already exist with sys_id: {0}',gr.getValue('sys_id'));
		gs.addInfoMessage(message);
		current.setAbortAction(true);
	}
	
})(current, previous);
