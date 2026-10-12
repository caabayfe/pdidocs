var decideRolesFieldVisibilityOnForm = function(parentId) {
	if (parentId) {
		var rolesGa = new GlideAjax('GuidedSetupAjaxProcessor');
		rolesGa.addParam('sysparm_name', 'decideVisibilityOfRolesField');
		rolesGa.addParam('sysparm_parent_content', parentId);
		rolesGa.getXML(GuidedSetupAjaxProcessorParse);
	} else {
		g_form.setDisplay('roles', false);
	}

	function GuidedSetupAjaxProcessorParse(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		var isRolesFieldVisible = (answer == "true"); // Ajax call returns string
		if (!isRolesFieldVisible) {
			g_form.setDisplay('roles', false);
		} else {
			g_form.setDisplay('roles', true);
		}
	}
};

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var isRootContent = (newValue == 'true');
	if (isRootContent) { // is_root_content is checked, so always show
		g_form.setDisplay('roles', true);
	} else {
		var parentId = g_form.getValue("parent"); // if unchecked, determine from parent
		decideRolesFieldVisibilityOnForm(parentId);
	}
}
