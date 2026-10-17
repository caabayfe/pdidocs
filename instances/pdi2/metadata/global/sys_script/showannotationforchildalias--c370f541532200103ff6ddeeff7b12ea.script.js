(function executeRule(current, previous /*null when async*/) {
	var varibleArray = [];
	varibleArray.push(current.parent.id);
	var link = new SNC.ContextDocAPI().getURLFromName('CSHelp:child-alias');
	varibleArray.push(link);
	gs.addInfoMessage(gs.getMessage('This child alias inherits properties from parent alias {0}. Click <a href="{1}" target="_blank">here</a> for more information about configuring child aliases.', varibleArray));
})(current, previous);
