(function(){
	var uri = action.getGlideURI();
	var path = 'sys_recipient_notif_preference.do';
	action.setRedirectURL(uri.toString(path));
	action.setNoPop(true);
})();
