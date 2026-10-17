(function() {
	var stack = gs.getSession().getStack();
	stack.pop();
	var referringUrl = action.getValues().get('sysparm_referring_url');
	
	if (referringUrl) {
		stack.push(referringUrl);
	} else {
		stack.push('sys_notification.do?sys_id=' + action.getGlideURI().getMap().get('sysparm_collectionID'));
	}

	var uri = action.getGlideURI();
	
	var wizID = new GlideappWizardIntercept('sys_notification_action.do').get();
	if (wizID) {
		uri.deleteParmameter('sysparm_referring_url');
		uri.set('sysparm_parent', wizID);
		uri.set('sysparm_collection', 'sys_notification');
		uri.set('sysparm_collectionID', action.getGlideURI().getMap().get('sysparm_collectionID'));
		uri.set('sysparm_referring_url', uri.toString());
		action.setRedirectURL(uri.toString('wizard_view.do'));
	}

	action.setNoPop(true);

})();
