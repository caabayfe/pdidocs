function onBefore(current, previous) {
	var blacklist = ["insert", "delete", "drop", "update", "limit"];
	var replacement = current.getValue('replacement');
	
	// Strip out anything wrapped in quotes or backticks (e.g. column names, parameter values)
	// (["'`])       --> match a single quote/backtick character (any of the three)
	// ((?=(\?))\2.) --> if backslash exists, gobble it, whether or not that happens, match a character
	// *?            --> match many times (non-greedily, as to not eat the closing quote)
	//  \1           --> match the opening quote 
	replacement = replacement.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/gi, "").toLowerCase();
	gs.print("Checking for prohibited commands in '" + replacement + "'");
	replacement = replacement.split(" ");
	for (var i in blacklist) {
		if (replacement.indexOf(blacklist[i]) > -1) {
			gs.addErrorMessage(gs.getMessage("Query replacement contains prohibited command: {0}", blacklist[i]));
			current.active = false;
			current.setAbortAction(true);
			return;
		}
	}

}
