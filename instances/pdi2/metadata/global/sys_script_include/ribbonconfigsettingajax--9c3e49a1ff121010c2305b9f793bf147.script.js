var RibbonConfigSettingAjax = Class.create();
RibbonConfigSettingAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	type: 'RibbonConfigSettingAjax',
	process: function() {
		var result = this.newItem('ribbon');
		result.setAttribute('is-valid', 'false');
		if (!gs.getUser().hasRole('agent_workspace_user'))
			return;
		var ribbon = this.getParameter('sysparm_ribbon');
		if (ribbon) {
			var gr = new GlideRecord('sys_aw_ribbon_setting');
			if (gr.isValid() && gr.get(ribbon)) {
				result.setAttribute('is-valid', 'true');
				result.setAttribute('table', gr.getValue('table'));
				result.setAttribute('width', gr.getValue('width'));
			}
		}
	}
});
