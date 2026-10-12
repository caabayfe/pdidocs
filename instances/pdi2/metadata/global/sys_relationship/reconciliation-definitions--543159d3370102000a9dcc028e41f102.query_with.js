(function refineQuery(current, parent) {

	var tableList = new GlideDBObjectManager.get().getTables(parent.name);
	var tables = '';
	for (var i = 0; i < tableList.size(); i++) {
		tables += tableList.get(i);
		if(i < tableList.size()-1)
			tables += ',';
	}
	
	current.addQuery('applies_to', 'IN' , tables);

})(current, parent);
