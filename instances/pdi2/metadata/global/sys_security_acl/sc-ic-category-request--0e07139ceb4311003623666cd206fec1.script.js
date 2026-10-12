(function() {
	return (current.manager == gs.getUserID() || current.editors.indexOf(gs.getUserID()) >= 0);
})()
