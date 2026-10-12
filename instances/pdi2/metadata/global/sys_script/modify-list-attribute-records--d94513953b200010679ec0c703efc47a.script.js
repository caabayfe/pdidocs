(function executeRule(current, previous /*null when async*/) {
	
		if (current.isActionAborted())
			return;

		var previousArray = previous.list_attributes.split(',') || [];
		var currentArray = current.list_attributes.split(',');
		
		var removed = [];
		var added = [];
		
		for (var i = 0; i < previousArray.length; i++) {
			if(currentArray.indexOf(previousArray[i]) === -1)
				removed.push(previousArray[i]);
		}

		for (i = 0; i < currentArray.length; i++) {
			if(currentArray[i] && previousArray.indexOf(currentArray[i]) === -1);
				added.push(currentArray[i]);
		}

		for (i = 0; i < removed.length; i++) {
			var grRemoveAttribute = new GlideRecord('sys_aw_list_attribute');
			grRemoveAttribute.addQuery('list', current.getUniqueValue());
			grRemoveAttribute.addQuery('attribute', removed[i]);
			grRemoveAttribute.query();

			if (grRemoveAttribute.next()) {
				grRemoveAttribute.setWorkflow(false);
				grRemoveAttribute.deleteRecord();
			}
		}

		for (i = 0; i < added.length; i++) {
			if (added[i] && added[i] != 'NULL') {
				var grAddAttribute = new GlideRecord('sys_aw_list_attribute');
				grAddAttribute.addQuery('list', current.getUniqueValue());
				grAddAttribute.addQuery('attribute', added[i]);
				grAddAttribute.query();
				if (grAddAttribute.hasNext())
					continue;
				
				grAddAttribute.initialize();
				grAddAttribute.setValue('list', current.getUniqueValue());
				grAddAttribute.setValue('attribute', added[i]);
				grAddAttribute.setWorkflow(false);
				grAddAttribute.insert();
			}
		}
})(current, previous);
