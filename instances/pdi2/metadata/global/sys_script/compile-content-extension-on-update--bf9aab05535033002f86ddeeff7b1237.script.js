(function executeRule(current, previous /*null when async*/) {
	var wcu = new WorkspaceCompilerUtils();
	if (gs.nil(current.workspace_config) || !wcu.isValidUxPageRegistry(current.workspace_config.compiled_page_registry)) {
		if (gs.nil(current.workspace_config))
			gs.addErrorMessage('Could not compile module, missing Workspace record');
		else
			gs.addErrorMessage('Could not compile module, Workspace record not associated with UX Page Registry');
		return;
	}
	
	if (!wcu.isValidContentExtension(current.content))
		current.content = '';
	if (!wcu.isValidContentExtension(current.detail))
		current.detail = '';
	if (!wcu.isValidContentExtension(current.toolbar_button))
		current.toolbar_button = '';
	
	// Always update the button content extension to ensure the name, module-id, icon and label 
	// are in synch with the sys_aw_module record.
	current.toolbar_button = updateButtonContentExtension();
	
	// Cleanup any obsolete compiled content extensions when the type changes.
	if (current.type == 'win' && previous.type != 'win') {
		// if the type changed to win, then no content extensions should be associated with this module
		// and there is nothing left to do in this BR.
		wcu.deactivateAllContentExtensions(current);
		return;
	} else if (current.type == 'full' && previous.type == 'master_detail') {
		// detail_component and detail is no longer valid if user switched from master_detail to a different type
		current.detail_component = '';
		wcu.deactivateContentExtension(current.detail);
	}	

	updateContentExtensions();
	
	function updateContentExtensions() {

		if (current.content_component == '' && previous.content_component != '') {
			// If they clear out content component, do not delete any content extensions, 
			// just deactivate all content extensions (instead of delete) and return immediate because they may need 
			// to reactivate them later and there is nothing left to update
			wcu.deactivateAllContentExtensions(current);
			return;
		}
		
		if ((current.content_component != previous.content_component) || (!gs.nil(current.content_component && gs.nil(current.content)))) {
			// User changed the content_component reference. Since each component 
			// can have different attributes we need to first figure out
			// how they changed it and then take the appropriate action

			var boundPrimaryCompiler = function (gr) { return wcu.compilePrimaryContentExtension(gr); };

			current.content = updateContentExtension(
				current.content_component,
				previous.content_component,
				current.content,
				boundPrimaryCompiler);
		}
		updateContentExtMiscFields(current.content, current, 'Module Content');
		
		if ((current.detail_component != previous.detail_component) || (!gs.nil(current.detail_component && gs.nil(current.detail)))) {
			// User changed the detail_component reference. Since each component 
			// can have different attributes we need to first figure out
			// how they changed it and then take the appropriate action

			var boundSecondaryCompiler = function (gr) { return wcu.compileSecondaryContentExtension(gr); };

			current.detail = updateContentExtension(
				current.detail_component,
				previous.detail_component,
				current.detail,
				boundSecondaryCompiler);
		}
		updateContentExtMiscFields(current.detail, current, 'Detail Content');

		if (!gs.nil(current.content))
			wcu.setRolesForElement(current.content, wcu.getArrayFromGlideList(current, 'roles'));
		if (!gs.nil(current.detail))
			wcu.setRolesForElement(current.detail, wcu.getArrayFromGlideList(current, 'roles'));
		updateContentExtensionAttributes(current.detail_attrs, current.detail);
		updateContentExtensionAttributes(current.content_attrs, current.content);
	}

	function updateContentExtension(currentComponent, previousComponent, compiledContentExtension, compiler) {
		var content;
		if (currentComponent.changes() && gs.nil(currentComponent)) {
			wcu.deactivateContentExtension(compiledContentExtension);
		} else if (currentComponent.changes() && !gs.nil(currentComponent)) {
			// User changed the current component so we need to check if the previously compiled
			// content extension is still relevant.
			content = new GlideRecord('sys_ux_custom_content_root_elem');

			if (content.get(compiledContentExtension) && content.component != currentComponent) {
				wcu.deleteContentExtension(compiledContentExtension);
				compiledContentExtension = compiler(current);
			}
		} else if (!gs.nil(currentComponent) && gs.nil(compiledContentExtension)) {
			compiledContentExtension = compiler(current);
		}
		return compiledContentExtension;
	}
	
	function updateContentExtensionAttributes(attrs, compiledContentExtension) {
		var gr = new GlideRecord('sys_ux_custom_content_root_elem');
		
		if (gr.get(compiledContentExtension)) {
			Object.keys(attrs).forEach(function(key) {
				if (key == 'sys_id' || key == 'sys_meta') {
					return;
				}
				gr.attrs[key] = attrs[key];
			});
			
			gr.setValue('active', current.active);
			gr.update();
		}
	}
	
	function updateContentExtMiscFields(contentExtId, currentModule, labelSuffix) {
		if (gs.nil(currentModule.content))
			return;
		// fieldMap: [{moduleField: contExtField}, ..]
		var fieldMap = {
			'active': 'active',
			'order': 'order',
			'label': 'name'
		}, moduleField, contExtField, p;
		var needsUpdate = false;
		var content = new GlideRecord('sys_ux_custom_content_root_elem');
		if (content.get(contentExtId)) {
			for (p in fieldMap) {
				if (!fieldMap.hasOwnProperty(p))
					continue;
				moduleField = p;
				contExtField = fieldMap[p];
				if (currentModule[moduleField].changes()) {
					content[contExtField] = currentModule[moduleField] +
						('label' === contExtField ? ' ' + labelSuffix : '');
					needsUpdate = true;
				}
			}
			if (needsUpdate)
				content.update();
		}
	}
	
	function updateButtonContentExtension() {
		var gr = new GlideRecord('sys_ux_custom_content_root_elem');
		var name = (current.getValue('label') || current.getValue('id')) + ' Button';
		
		if (gr.get(current.toolbar_button)) {
			gr.setValue('name', name);
			wcu.updateButton(gr, current);
			return current.toolbar_button + '';
		} else {
			return wcu.createButton(current);
		}
	}
})(current, previous);
