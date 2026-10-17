var EditableTemplateChecker = Class.create();

EditableTemplateChecker.prototype = {
    initialize: function() {
    },
	
	editable: function(scopeId) {
		//Maint can always
		if (gs.hasRole('maint'))
			return true;

		//If you're not maint the property has to be on
		if (gs.getProperty('com.snc.app_templates.enable_role_based_authoring', 'false') === 'false')
			return false;
		
		//If you're a template admin, yes
		if (gs.hasRole('app_template_admin'))
			return true;

		//If you're not a template author, no
		if (!gs.hasRole('app_template_author'))
			return false;	
		
		//If there isn't a scope, you should see the new button, so yes
		if (!scopeId)
			return true;
		
		//If it's in global scope, then you need to be maint, admin, or template admin to edit this
		if(scopeId == 'global')
			return false;

		var templateScriptableAPI = new sn_templates.TemplateScriptableAPI();
		var scopeList = templateScriptableAPI.getUndecoratedScopeList();
		
		var canEditScope = scopeList.indexOf(scopeId) >  -1;

		//Otherwise you must be able to edit the template's scope
		return canEditScope;
	},

    type: 'EditableTemplateChecker'
};
