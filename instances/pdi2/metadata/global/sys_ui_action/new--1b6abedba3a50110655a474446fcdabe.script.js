(function(){
	var uri = action.getGlideURI();
	var path = 'sys_notif_category_preference.do';
	action.setRedirectURL(uri.toString(path));
	action.setNoPop(true);
})();
