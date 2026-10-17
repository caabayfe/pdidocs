function populateLeftAndRightScopeEditor(dataLeft, dataRight) {
	slushbucketPopulateHelper(gel('scope_slush_left'), dataLeft);
	slushbucketPopulateHelper(gel('scope_slush_right'), dataRight);
}

function slushbucketPopulateHelper(select, data) {
	select.options.length = 0;
	if(data) {
		var list = data.split('^');
		for (var i = 0; i != list.length; i++) {
			var t = list[i].split(':');
			var label = atob(t[0]);
			var value = atob(t[1]);
			var o = new Option(label, value);
			select.options[select.options.length] = o;
		}
	}
}

function cancel() {
	g_form.fieldChanged('scope_slush', false);
	setTimeout(function() {reloadWindow(self);}, 1);
}

function editScopes() {
	g_form.fieldChanged('scope_slush', false);
	var jsonScopes = {
		"additionalScopes": scope_slush.getValues(scope_slush.getRightSelect()) || [],
		"removedScopes": scope_slush.getValues(scope_slush.getLeftSelect()) || []
	};
	var stringScopes = JSON.stringify(jsonScopes);
	
	var ga = new GlideAjax('AJAXAddScopes');
	ga.addParam('sysparm_name', 'updateScopes');
	ga.addParam('sysparm_scopes', stringScopes);
	ga.addParam('sysparm_oauthEntityId', g_form.getUniqueValue());
	ga.getXML(function(result) {
		g_navigation.reloadWindow();
	});
}
