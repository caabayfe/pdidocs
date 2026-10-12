(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    const apiHelper = new APIHelper(request, response);

    apiHelper.execute(function() {
        const hasDomainPickerRole = gs.hasRole(gs.getProperty('glide.ui.domain_picker.role', 'itil'));
        const hasAdminRole = gs.hasRole('ui_builder_admin');
        const hasDelegatedDevRole = gs.hasRole('delegated_developer');
        const isDomainSeparationPluginActive = GlidePluginManager.isActive('com.glide.domain.msp_extensions.installer');
        const displayDomainPicker = hasDomainPickerRole && isDomainSeparationPluginActive;
		const isThemeBuilderEnabled = GlidePluginManager.isActive('sn_theme_builder');
		const isGenAiActive = GlidePluginManager.isActive('sn_generative_ai');
		const isSkillKitActive = GlidePluginManager.isActive('sn_skill_builder');

        apiHelper.getResponse({
            supportDomain: isDomainSeparationPluginActive,
            displayDomainPicker: displayDomainPicker,
            displayScopePicker: hasAdminRole || hasDelegatedDevRole,
            currentScope: gs.getCurrentApplicationId(),
            currentDomain: gs.getSession().getCurrentDomainID(),
            userName: gs.getUserID(),
			userLanguage: gs.getSession().getLanguage(),
			isThemeBuilderEnabled,
			isGenAiActive,
			isSkillKitActive
        });
    });
})(request, response);
