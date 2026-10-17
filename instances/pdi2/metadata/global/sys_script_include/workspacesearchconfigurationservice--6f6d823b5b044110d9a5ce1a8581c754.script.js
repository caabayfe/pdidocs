var WorkspaceSearchConfigurationService = Class.create();
WorkspaceSearchConfigurationService.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    type: 'WorkspaceSearchConfigurationService',

    USER_PREFERENCES_TABLE: 'sys_user_preference',
    LEGACY_PREFERENCE_NAME: 'workspace.globalSearch.recentActions',
    PREFIX: 'globalSearch.now/',
    GLOBAL_SEARCH_PATH: 'nav/ui',
    WORKSPACE_CATEGORY_ID: 'afb4e3e173322010f0ca1e666bf6a726',
    UNIFIED_NAV_APP_ID: 'c86a62e2c7022010099a308dc7c26022',

    /**
     * Returns a list of workspaces (name and workspaceID) that are configured to
     * use the specified Search Application Configuration
     */
    getWorkspacesBySearchAppConfigID: function() {
        if (!gs.hasRole('search_application_admin')) {
            return 'The search_application_admin role is required to execute this script';
        }
        var sacID = this.getParameter('sysparm_sac_id');
        var propertiesGR = new GlideRecord('sys_ux_page_property');
        propertiesGR.addQuery('name', 'globalSearchDataConfigId');
        propertiesGR.addQuery('value', sacID);
        propertiesGR.query();
        var response = [];
        while (propertiesGR.next()) {
            response.push({
                'name': propertiesGR.getDisplayValue('page'),
                'workspaceID': propertiesGR.getValue('page')
            });
        }
        return JSON.stringify(response);
    },

    /**
     * Returns a list of the relative URL paths for search-enabled workspaces (e.g. "cwf/agent")
     */
    getGlobalSearchContextURLs: function() {
        if (!gs.hasRole('search_application_admin')) {
            return 'The search_application_admin role is required to execute this script';
        }
        var response = [this.GLOBAL_SEARCH_PATH];

        var uxApps = new GlideRecord('sys_ux_registry_m2m_category');
        // Only get Workspaces
        uxApps.addQuery('experience_category', this.WORKSPACE_CATEGORY_ID);
        // Only get workspaces with the 'Unified Navigation App Shell' parent app
        uxApps.addQuery('page_registry.parent_app', this.UNIFIED_NAV_APP_ID);

        // Only get the workspaces where search is enabled in the chrome_header property, and 
        // there are globalSearchDataConfigId and global_search_configurations properties
        var propertyJoin = uxApps.addJoinQuery('sys_ux_page_property', 'page_registry', 'page');
        propertyJoin.addCondition('name', 'chrome_header');
        propertyJoin.addCondition('value', 'CONTAINS', 'searchEnabled": true');

        var propertyJoin2 = uxApps.addJoinQuery('sys_ux_page_property', 'page_registry', 'page');
        propertyJoin2.addCondition('name', 'globalSearchDataConfigId');

        var propertyJoin3 = uxApps.addJoinQuery('sys_ux_page_property', 'page_registry', 'page');
        propertyJoin3.addCondition('name', 'global_search_configurations');

        uxApps.query();
        while (uxApps.next()) {
            response.push(uxApps.page_registry.path);
        }
        return response;
    },

    /**
     * Copies over the workspace suggestion values provided in "existingValues" to a new 
     * preference named after the provided path. 
     *
     * It will first create the preference if it doesn't exist, else it will 
     * overwrite the values if it does
     */
    copySuggestionsForUser: function(paths, user, existingValue) {
        var parentScope = this;
        paths.forEach(function(path) {
            var userPrefRecord = new GlideRecord(parentScope.USER_PREFERENCES_TABLE);
            userPrefRecord.addQuery('name', parentScope.PREFIX + path);
            userPrefRecord.addQuery('user', user);
            userPrefRecord.query();
            if (!userPrefRecord.next()) {
                userPrefRecord.initialize();
                userPrefRecord.setValue('user', user);
                userPrefRecord.setValue('name', parentScope.PREFIX + path);
                userPrefRecord.setValue('value', existingValue);
                userPrefRecord.insert();
            } else {
                userPrefRecord.setValue('value', existingValue);
                userPrefRecord.update();
            }
        });
    },

    /**
     * Copies over user suggestion preferences from the legacy workspace 
     * preference (workspace.globalSearch.recentActions) to the new preference 
     * for each workspace, plus global search
     */
    copyLegacySuggestionsForPolaris: function() {
        var paths = this.getGlobalSearchContextURLs();
        var userPrefs = new GlideRecord(this.USER_PREFERENCES_TABLE);
        userPrefs.addQuery('name', this.LEGACY_PREFERENCE_NAME);
        userPrefs.query();
        while (userPrefs.next()) {
            this.copySuggestionsForUser(paths, userPrefs.getValue('user'), userPrefs.getValue('value'));
        }
    }
});
