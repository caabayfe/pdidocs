var uri = action.getGlideURI();
	var path = uri.getFileFromPath() + '';
	path = path.substring(0, path.length - 5) + '.do';
	uri.set('sys_id', '-1');
	if (path)
		action.setRedirectURL(uri.toString(path));

	action.setNoPop(true);
    
