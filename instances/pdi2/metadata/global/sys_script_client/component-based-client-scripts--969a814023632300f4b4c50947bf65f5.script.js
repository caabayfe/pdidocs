function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	function isNewRecord() {
		// oldValue is empty when this function is called for a new record
		return oldValue === '' && newValue === '';
	}
	
	function getComponentGr(componentSysId) {
		var gr = new GlideRecord('sys_ux_lib_component');
		if (gr.get(componentSysId))
			return gr;
	}
	
	function toggleReadOnlyFields(componentGr) {
		var allowedOverrides = componentGr.getValue('overrides');
		if (allowedOverrides === 'layout_only') {
			setLayoutAndChildrenReadOnlyState(false, true);
		} else if (allowedOverrides === 'children_and_layout') {
			setLayoutAndChildrenReadOnlyState(false, false);
		} else {
			setLayoutAndChildrenReadOnlyState(true, true);
		}
	}
	
	function setLayoutAndChildrenReadOnlyState(isLayoutReadOnly, isChildrenReadOnly) {
		g_form.setReadOnly('layout', isLayoutReadOnly);
		g_form.setDisplay('layout', !(isLayoutReadOnly && g_form.getValue('layout') == ''));
		g_form.setReadOnly('children', isChildrenReadOnly);
		g_form.setDisplay('children', !(isChildrenReadOnly && g_form.getValue('children') == ''));
	}
	
	function setLayoutAndChildrenValues(layout, children) {
		g_form.setValue('children', children);
		g_form.setValue('layout', layout);
	}

	if (isLoading) {
		if (isNewRecord())
			setLayoutAndChildrenReadOnlyState(true, true);
		else {
			// only modify read only states for existing records
			var componentGr = getComponentGr(newValue);
			if (componentGr)
				toggleReadOnlyFields(componentGr);
		}
	} else {
		var componentSysId = newValue;		
		if (componentSysId) {
			var componentGr = getComponentGr(componentSysId);
			if (componentGr) {
				setLayoutAndChildrenValues(componentGr.getValue('default_layout'), componentGr.getValue('default_children'));
				toggleReadOnlyFields(componentGr);
			}
		} else {
			setLayoutAndChildrenReadOnlyState(true, true);
			setLayoutAndChildrenValues('', '');
		}	
	}
}
