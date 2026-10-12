(function executeRule(current, previous /*null when async*/) {

	var credAliasList = current.tag.toString();
	var aliasGR = new GlideRecord('sys_alias');
	aliasGR.addEncodedQuery('sys_idIN' + credAliasList);
	aliasGR.addQuery("type", "connection");
	aliasGR.query();
	if (aliasGR.next()) {
		gs.addErrorMessage(gs.getMessage('Error: Alias {0} is not of type Credential', aliasGR.getValue('name')));
		current.setAbortAction(true);
	}
})(current, previous);
