(function(){
	var uri = action.getGlideURI();
	var path = 'sys_destination_preference.do';
	action.setRedirectURL(uri.toString(path));
	action.setNoPop(true);
})();
