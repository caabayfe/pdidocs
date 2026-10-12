(function refineQuery(current, parent) {

	// Filter by type "Provided By:Provides"
	current.addQuery('type', '4afd799338a02000c18673032c71b817');
	current.addQuery('child', parent.getValue('sys_id'));


})(current, parent);
