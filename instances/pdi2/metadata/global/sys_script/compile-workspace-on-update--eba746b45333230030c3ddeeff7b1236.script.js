(function executeRule(current, previous /*null when async*/) {
	var wcu = new WorkspaceCompilerUtils();
	
	if (current.workspace_url != previous.workspace_url) {
		var validation = wcu.runValidations(current);

		if (!validation.passes) {
			current.setAbortAction(validation.shouldAbort);
			gs.addInfoMessage(validation.message);
			return;
		}		
	}
	
	updateUxPageRegistry();
	updatePageProperties();
	
	function updateUxPageRegistry() {
		var gr = new GlideRecord('sys_ux_page_registry');
		
		if(gr.get(current.compiled_page_registry)) {
			gr.setValue('path', wcu.makeWorkspaceUxPageUrl(current.workspace_url));
			gr.setValue('active', current.active);
			gr.update();
		} else {
			current.setAbortAction(true);
			gs.addInfoMessage('Failed to find the compiled page registry associated with this workspace.');
			return;
		}
	}

	function updatePageProperties() {
		var uxPageProperty = new GlideRecord('sys_ux_page_property');

		uxPageProperty.addQuery('page', current.getValue('compiled_page_registry'));
		uxPageProperty.query();

		while (uxPageProperty.next()) {
			switch (uxPageProperty.getValue('name')) {
				case 'ws_active_notification':
					updateBooleanProperty(uxPageProperty, 'value', current.getValue('notifications_enabled'));
					break;
				case 'ws_active_search':
					updateBooleanProperty(uxPageProperty, 'value', current.getValue('search_enabled'));
					break;
				case 'ws_active_user_pref':
					updateBooleanProperty(uxPageProperty, 'value', current.getValue('user_preference_controls_enabled'));
					break;
				case 'ws_navigation_mode':
					updatePageProperty(uxPageProperty, 'choices', current.getValue('navigation_type'));
					break;
				default:
					continue;
			}
		}
	}
	
	function updateBooleanProperty(uxPageProperty, field, value) {
		value = value == "1" ? true : false;
		
		if (uxPageProperty.getValue(field) == value)
			return;
		
		uxPageProperty.setValue(field, value);
		uxPageProperty.update();
	}

	function updatePageProperty(uxPageProperty, field, value) {
		if (uxPageProperty.getValue(field) == value)
			return;

		uxPageProperty.setValue(field, value);
		uxPageProperty.update();
	}
})(current, previous);
