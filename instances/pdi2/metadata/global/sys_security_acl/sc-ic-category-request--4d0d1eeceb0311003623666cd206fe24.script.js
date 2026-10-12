(function() {
	if (current.manager == gs.getUserID() && current.state == "requested")
		return true;
	
	return false;
})();
