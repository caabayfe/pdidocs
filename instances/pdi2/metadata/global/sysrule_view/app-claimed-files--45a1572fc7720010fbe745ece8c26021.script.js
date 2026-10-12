(function overrideView(view, is_list) {
	
	var urlView = gs.action.getGlideURI().getMap().get('claimed_file_view');
	if (urlView == "true")
		answer = "claimed_files";

})(view, is_list);
