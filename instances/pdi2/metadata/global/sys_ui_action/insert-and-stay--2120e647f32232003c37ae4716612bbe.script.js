(function(current, action){
	var newService = new GlideRecord(current.getTableName());

	var redir = function(rec) {
	    var url = '' + rec.getTableName() + '.do?sys_id='+rec.getUniqueValue()+'&sysparm_view=Default&20view';
		action.setRedirectURL(url);
	};

	var allFields = current.getFields();
	for (var i = 0; i < allFields.size(); i++) {
		var fName = '' + allFields.get(i).getName();

		if (fName.startsWith('sys'))
			continue;
		if (fName.startsWith('view'))
			continue;
		if (fName == 'layer')
			continue;
		if (fName == 'type')
			continue;

		var curValue = current.getValue(fName);
		if (!curValue)
			continue;

		newService.setValue(fName, '' + curValue);
	}

	newService.insert();
    redir(newService.isActionAborted() ? current : newService);

})(current, action);
