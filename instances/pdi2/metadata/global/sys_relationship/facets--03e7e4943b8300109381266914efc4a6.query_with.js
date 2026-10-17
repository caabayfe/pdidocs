(function refineQuery(current, parent) {
	
	current.addQuery('subobject.activity_context', parent.sys_id);
	current.addQuery("module", parent.module);


})(current, parent);
