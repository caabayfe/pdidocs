function saveLinkData() {
	var parent_window = top.window.opener;
	// call the function in the parent window
	if (parent_window)
		parent_window.saveLinkData();
}

function deleteLink() {
	var parent_window = top.window.opener;
	// call the function in the parent window
	if (parent_window)
		parent_window.deleteLink();
}
