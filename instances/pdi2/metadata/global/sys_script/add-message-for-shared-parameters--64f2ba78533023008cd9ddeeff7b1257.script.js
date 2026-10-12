(function executeRule(current, previous /*null when async*/) {
	var scopeName = getScopeName(gs.getCurrentApplicationScope());
	var switchMessage = gs.getMessage('Switch to Global if you would like to add new Shared Parameters.');
	var applicationSelectedMessage = gs.getMessage('You currently have the {0} application selected, but can only add Shared Parameters in the Global Application. {1}', [scopeName, switchMessage]);
	
	gs.addInfoMessage(applicationSelectedMessage);
})(current, previous);

function getScopeName(scope) {
	var gr = new GlideRecord('sys_scope');
	gr.addQuery('scope', scope);
	gr.query();
	if (gr.next())
		return gr.name;
}
