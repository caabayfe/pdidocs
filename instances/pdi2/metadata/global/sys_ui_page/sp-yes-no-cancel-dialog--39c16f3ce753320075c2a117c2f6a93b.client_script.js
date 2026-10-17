function invokeCallBack(type) {
	try {
		var callback;
	
		var gdw = GlideDialogWindow.get();

		switch(type) {
			case 'yes':
				callback = gdw.getPreference('onYes');
				break;
			case 'no':
				callback = gdw.getPreference('onNo');
				break;
			default:
				callback = gdw.getPreference('onCancel');
		}

		if(typeof(callback) === 'function') {
			try {
				callback.call(gdw, gdw.getPreference('oldValue'));
			} catch(e) { }
		}

		gdw.destroy();
		gdw = null;
	} catch (e) { }
	
	return false;
}
