(function() {
	copyConfiguration();

	function copyConfiguration() {
		var currentDomain = 'global';
	
		if(gs.getUser().getDomainDisplayValue() != 'global')
			currentDomain = gs.getUser().getDomainID();

		var newName = gs.getUser().getDomainDisplayValue() + " Conversation Server Configuration";
		var oldID = current.getValue("sys_id");
		
		current.setValue("name", newName);
		current.setValue("sys_domain", currentDomain);
		
		var newID = current.insert() + '';
		var configs = new GlideRecord('sys_cs_configuration');
		configs.addQuery('parent', oldID);
		configs.query();
		
		while (configs.next()) {
			configs.setValue("parent", newID);
			configs.setValue("sys_domain", currentDomain);
			configs.insert();
		}
	}
})();
