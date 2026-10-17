var FlowDesignerContentFiltering = Class.create();
FlowDesignerContentFiltering.prototype = {
    initialize: function() {
        this.currentScopeId = null;
    },

    getCurrentScopeId: function() {
        if (this.currentScopeId == null)
            this.currentScopeId = gs.getCurrentApplicationId();
        return this.currentScopeId;
    },

    canCreate: function(contentGr) {
        return this._isAllowedByContentFiltering(contentGr, 'create');
    },

    canRead: function(contentGr) {
        return this._isAllowedByContentFiltering(contentGr, 'read');
    },

    _isAllowedByContentFiltering: function(contentGr, operation) {
		if (gs.hasRole("flow_admin"))
			return true;
			
        if (gs.getProperty('com.glide.hub.flow.disable_content_filtering', 'false') == 'true')
            return true;


        if (contentGr.sys_created_by == gs.getUserName())
            return true;

        var tableHierarchy = this._getTableHierarchyFor(contentGr);
        if (this._isBlacklisted(contentGr, tableHierarchy, operation))
            return false;

        if (this._isWhiteListed(contentGr, tableHierarchy, operation))
            return true;

        return false;
    },

    _isBlacklisted: function(contentGr, tableHierarchy, operation) {
        if (this._evaluateFilterRules(contentGr, tableHierarchy, true, operation))
            return true;

        return false;
    },

    _isWhiteListed: function(contentGr, tableHierarchy, operation) {
        if (this._evaluateFilterRules(contentGr, tableHierarchy, false, operation))
            return true;

        return false;
    },

    _shouldAddScopeToRuleQuery: function(tableHierarchy) {
        var filterTables = PDConstants.CONTENT_FILTER_TABLES || [PDConstants.TABLES.PD_ACTIVITY_DEFINITION];
        for (var i = 0; i < filterTables.length; i++) {
            if (tableHierarchy.contains(filterTables[i]))
                return false;
        }
        return !tableHierarchy.startsWith('sys_hub_ui_');
    },

    _evaluateFilterRules: function(contentGr, tableHierarchy, isBlackList, operation) {
        var gr = new GlideRecord('sys_hub_resource_filter_rule');
        gr.addQuery('resource.table', 'IN', tableHierarchy);

        if (this._shouldAddScopeToRuleQuery(tableHierarchy)) {
            var qc = gr.addQuery('sys_scope', 'global');
            var sysScope = contentGr.sys_scope;
            //for context records, get the scope from the parent flow/action
            if (tableHierarchy == 'sys_flow_context')
                sysScope = this._getScopeFromFlowOrAction(contentGr);
            qc.addOrCondition('sys_scope', sysScope);
        }

        if (isBlackList)
            gr.addQuery('filter_type', 'blacklist');
        else
            gr.addQuery('filter_type', '!=', 'blacklist').addOrCondition('filter_type', '');

        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            if (!gr.resource)
                continue;

            if (!this._evaluateUserRoles(gr))
                continue;

            if (!this._evaluateDelegatedDeveloperAccess(gr, operation))
                continue;

            var conditionEmpty = GlideStringUtil.nil(gr.resource.conditions);
            var conditionTrue = GlideFilter.checkRecord(contentGr, gr.resource.conditions);

            var tagsSatisfied = this._hasRequiredLabelEntries(gr, contentGr, tableHierarchy);
            if ((conditionEmpty || conditionTrue) && tagsSatisfied) {
                return true;
            }
        }

        return false;
    },

    _getScopeFromFlowOrAction: function(contextGr) {
        var scope;
        var flow = new GlideRecord('sys_hub_flow');
        if (flow.get('sys_id', contextGr.flow)) {
            scope = flow.getValue('sys_scope');
        } else {
            flow = new GlideRecord('sys_hub_action_type_definition');
            if (flow.get('sys_id', contextGr.flow))
                scope = flow.getValue('sys_scope');
        }
        return scope;
    },

    _evaluateUserRoles: function(ruleGr) {
        if (GlideStringUtil.nil(ruleGr.role))
            return false;

        return gs.getSession().hasRole(ruleGr.role);
    },

    /**
     * If roles do not contain 'delegated_developer', we don't need to check anything else
     * 
     * If roles contain 'delegated_developer' and the user has this role, we need further checks: 
     *   - If development permission is specified, we check they have access to the resource.
     *   - If no development permission specified, we assume they can have access.
     * 
     * Note: rule authors should strive to specify a development permission if 'delegated_developer' is used
     */
    _evaluateDelegatedDeveloperAccess: function(ruleGr, operation) {
        if (!ruleGr.role.includes('delegated_developer'))
            return true;

        if (!this._hasRoleExactly('delegated_developer'))
            return true;

        var resourcePath = (ruleGr.delegated_development_permission || {}).resource_path;
        var scope = null;

        if (!resourcePath)
            return true;

        if (resourcePath.startsWith('record'))
            resourcePath = resourcePath + "/" + operation;

        if (resourcePath.startsWith('api')) {
            scope = {
                scopeId: this.getCurrentScopeId()
            };
        }

        return gs.hasRightsTo(resourcePath, scope);
    },

    /** 
     * hasRoleExactly function checks if the current user has an exact role match
     * @param {String} - role to be checked
     * @returns {boolean} Returns true if the user has the role even without an admin role
     */
    _hasRoleExactly: function(roleName) {
        var roles = gs.getUser().getRoles() || [];
        return roles.indexOf(roleName) >= 0;
    },

    _getTableHierarchyFor: function(contentGr) {
        // We could expand to sibling extended tables by using
        // tableUtils.getAbsoluteBase() before calling getHierarchy()

        var tableUtils = new TableUtils(contentGr.getTableName());
        var tableHierarchy = tableUtils.getHierarchy();
        return GlideStringUtil.join(tableHierarchy);
    },

    _getTagsFor: function(contentGr, tableHierarchy) {
        var tagMap = {};
        var labelEntries = new GlideRecord('label_entry');
        labelEntries.addQuery('table', 'IN', tableHierarchy);
        labelEntries.addQuery('table_key', contentGr.getUniqueValue());
        labelEntries.query();
        while (labelEntries.next())
            tagMap[labelEntries.label] = true;

        return tagMap;
    },

    _hasRequiredLabelEntries: function(ruleGr, contentGr, tableHierarchy) {
        if (!ruleGr.resource || !ruleGr.resource.resource_tags)
            return true;

        this.tagMap = this.tagMap || this._getTagsFor(contentGr, tableHierarchy); //Memoize tag map
        var resourceTags = ruleGr.resource.resource_tags.split(',');
        for (var i = 0; i < resourceTags.length; i++) {
            if (!this.tagMap[resourceTags[i]])
                return false;
        }

        return true;
    },

    type: 'FlowDesignerContentFiltering'
};
