(function executeRule(current, previous /*null when async*/) {

	gs.addInfoMessage("Cannot have fixed footer with unfixed header - footer has been set to unfixed");
	current.footer_fixed = false;

})(current, previous);
